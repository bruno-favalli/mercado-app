import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgxCurrencyDirective } from 'ngx-currency';
import { MatDialog } from '@angular/material/dialog';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { CompraService } from '../../services/compra';
import { MercadosFavoritosService } from '../../services/mercados-favoritos';
import { DialogoConfirmacaoComponent } from '../../components/dialogo-confirmacao/dialogo-confirmacao';
import { FormProduto } from '../../components/form-produto/form-produto';
import { Produto } from '../../models/compra.model';

@Component({
  selector: 'app-compra-ativa',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatDividerModule,
    CurrencyPipe,
    DecimalPipe,
    FormProduto,
    MatProgressBarModule,
    NgxCurrencyDirective,
  ],
  templateUrl: './compra-ativa.html',
  styleUrl: './compra-ativa.scss'
})
export class CompraAtiva {

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  compraService = inject(CompraService);

  favoritosService = inject(MercadosFavoritosService);
  compraAtiva = this.compraService.getCompraAtiva();
  total = this.compraService.totalCompraAtiva;
  percentualOrcamento = this.compraService.percentualOrcamento;

  // Controla se a seção de favoritos está em modo de edição
  modoEdicaoFavoritos = signal(false);

  // FormControl para o input de novo mercado favorito
  novoFavoritoControl = new FormControl('', [
    Validators.required,
    Validators.minLength(2)
  ]);

  // Signal que guarda qual produto está sendo editado no momento
  // null = modo "adicionar", Produto = modo "editar"
  produtoEditando = signal<Produto | null>(null);

  // FormControl independente — compartilhado entre atalhos e formulário
  // nullable: true na config global garante que campo vazio = null, não zero
  orcamentoControl = new FormControl<number | null>(null);

  formMercado: FormGroup = this.fb.group({
    mercado: ['', [Validators.required, Validators.minLength(3)]]
  });

  // Lê o orçamento do FormControl compartilhado
  private getOrcamento(): number | undefined {
    const valor = this.orcamentoControl.value;
    return valor ? Number(valor) : undefined;
  }

  toggleEdicaoFavoritos(): void {
    // signal.update() com negação booleana: false→true, true→false
    this.modoEdicaoFavoritos.update(v => !v);
    // Limpa o input ao entrar/sair do modo edição
    this.novoFavoritoControl.reset();
  }

  adicionarFavorito(): void {
    if (this.novoFavoritoControl.invalid) return;
    this.favoritosService.adicionar(this.novoFavoritoControl.value!);
    this.novoFavoritoControl.reset();
  }

  removerFavorito(nome: string): void {
    this.favoritosService.remover(nome);
  }

  iniciarCompraDireta(mercado: string): void {
    this.compraService.iniciarCompra(mercado, this.getOrcamento());
    this.orcamentoControl.reset();
  }

  iniciarCompra(): void {
    if (this.formMercado.invalid) return;
    const { mercado } = this.formMercado.value;
    this.compraService.iniciarCompra(mercado, this.getOrcamento());
    this.formMercado.reset();
    this.orcamentoControl.reset();
  }

  // Recebe o evento (salvo) do form-produto
  // O tipo do parâmetro é Omit<Produto, 'id'> — sem o id, pois é novo ou já existe
  onSalvo(dados: Omit<Produto, 'id'>): void {
    const editando = this.produtoEditando();

    if (editando) {
      // Modo edição: atualiza o produto existente pelo id
      this.compraService.editarProduto(editando.id, dados);
      this.produtoEditando.set(null); // sai do modo edição
    } else {
      // Modo adição: cria produto novo
      this.compraService.adicionarProduto(dados);
    }
  }

  // Ativado pelo botão de editar no card do produto
  iniciarEdicao(produto: Produto): void {
    this.produtoEditando.set(produto);
    // Rola para o topo para o usuário ver o formulário preenchido
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Recebe o evento (cancelado) do form-produto
  onCancelado(): void {
    this.produtoEditando.set(null);
  }

  removerProduto(id: string): void {
    // Se estava editando este produto, cancela a edição primeiro
    if (this.produtoEditando()?.id === id) {
      this.produtoEditando.set(null);
    }
    this.compraService.removerProduto(id);
  }

  calcularSubtotal(quantidade: number, valorUnitario: number): number {
    return quantidade * valorUnitario;
  }

  finalizarCompra(): void {
    const ref = this.dialog.open(DialogoConfirmacaoComponent, {
      data: {
        titulo: 'Finalizar compra',
        mensagem: `Deseja finalizar a compra no ${this.compraAtiva()?.mercado}? Ela será salva no histórico.`,
        textoBotaoConfirmar: 'Finalizar',
        corBotaoConfirmar: 'primary'
      }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.compraService.finalizarCompra();
        this.router.navigate(['/historico']);
      }
    });
  }

  cancelarCompra(): void {
    const ref = this.dialog.open(DialogoConfirmacaoComponent, {
      data: {
        titulo: 'Cancelar compra',
        mensagem: 'Tem certeza? Todos os produtos adicionados serão perdidos.',
        textoBotaoConfirmar: 'Cancelar compra',
        corBotaoConfirmar: 'warn'
      }
    });

    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.compraService.cancelarCompra();
        this.router.navigate(['/']);
      }
    });
  }
}