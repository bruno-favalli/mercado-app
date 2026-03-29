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
    CurrencyPipe
  ],
  templateUrl: './compra-ativa.html',
  styleUrl: './compra-ativa.scss'
})
export class CompraAtiva {

  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  compraService = inject(CompraService);

  compraAtiva = this.compraService.getCompraAtiva();
  total = this.compraService.totalCompraAtiva;

  formMercado: FormGroup = this.fb.group({
    mercado: ['', [Validators.required, Validators.minLength(3)]]
  });

  formProduto: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    quantidade: [1, [Validators.required, Validators.min(1)]],
    valorUnitario: [null, [Validators.required, Validators.min(0.01)]]
  });

  sugestoes = signal<string[]>([]);
  onNomeInput(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.sugestoes.set(this.compraService.getSugestoes(valor));
  }
  
  // Chamado quando o usuário seleciona uma sugestão
  // Preenche o campo e limpa as sugestões
  selecionarSugestao(sugestao: string): void {
    this.formProduto.patchValue({ nome: sugestao });
    this.sugestoes.set([]);
  }

  iniciarCompra(): void {
    if (this.formMercado.invalid) return;
    const { mercado } = this.formMercado.value;
    this.compraService.iniciarCompra(mercado);
    this.formMercado.reset();
  }

  adicionarProduto(): void {
    if (this.formProduto.invalid) return;
    const { nome, quantidade, valorUnitario } = this.formProduto.value;
    this.compraService.adicionarProduto({
      nome,
      quantidade: Number(quantidade),
      valorUnitario: Number(valorUnitario)
    });
    this.formProduto.reset({ quantidade: 1 });
  }

  removerProduto(id: string): void {
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