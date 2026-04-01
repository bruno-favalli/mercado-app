import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { CurrencyPipe } from '@angular/common';
import { CompraService } from '../../services/compra';
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
    FormProduto,
  ],
  templateUrl: './compra-ativa.html',
  styleUrl: './compra-ativa.scss'
})
export class CompraAtiva {

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  compraService = inject(CompraService);

  mercadosFavoritos = ['Tauste', 'Assaí', 'Shibatta', 'Carrefour', 'Nagumo', 'Semmar'];
  compraAtiva = this.compraService.getCompraAtiva();
  total = this.compraService.totalCompraAtiva;

  // Signal que guarda qual produto está sendo editado no momento
  // null = modo "adicionar", Produto = modo "editar"
  produtoEditando = signal<Produto | null>(null);

  formMercado: FormGroup = this.fb.group({
    mercado: ['', [Validators.required, Validators.minLength(3)]]
  });

  iniciarCompraDireta(mercado: string): void {
    this.compraService.iniciarCompra(mercado);
  }

  iniciarCompra(): void {
    if (this.formMercado.invalid) return;
    const { mercado } = this.formMercado.value;
    this.compraService.iniciarCompra(mercado);
    this.formMercado.reset();
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