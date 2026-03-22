import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CompraService } from '../../services/compra';
import { Compra } from '../../models/compra.model';
import { DialogoConfirmacaoComponent } from '../../components/dialogo-confirmacao/dialogo-confirmacao';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [
    CurrencyPipe,
    DatePipe,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './historico.html',
  styleUrl: './historico.scss'
})
export class Historico {

  // inject() é a forma moderna de injetar dependências no Angular 19
  // Equivalente ao constructor(private router: Router) do jeito antigo
  private router = inject(Router);
  private dialog = inject(MatDialog); // Serviço para abrir diálogos modais
  compraService = inject(CompraService);

  // Signal readonly do histórico — atualiza a tela automaticamente
  // quando uma compra é adicionada ou removida
  historico = this.compraService.getHistorico();

  // Calcula o total de uma compra somando quantidade x valorUnitario
  // de todos os produtos. Feito aqui no .ts e não no template
  // para manter o HTML limpo e evitar problemas de precedência de pipe
 // Calcula o total geral de uma compra
calcularTotal(compra: Compra): number {
  return compra.produtos.reduce((total, p) => {
    return total + (p.quantidade * p.valorUnitario);
  }, 0);
}

// Calcula o subtotal de um produto individual
calcularSubtotal(produto: any): number {
  return produto.quantidade * produto.valorUnitario;
}

  // Navega para a tela de compra ativa para iniciar nova compra
  novaCompra(): void {
    this.router.navigate(['/compra']);
  }

  // Volta para a tela inicial
  voltar(): void {
    this.router.navigate(['/']);
  }

  // Abre diálogo de confirmação antes de deletar a compra do histórico
  // Boa prática: sempre confirmar ações destrutivas irreversíveis
  deletarCompra(compra: Compra): void {
    const ref = this.dialog.open(DialogoConfirmacaoComponent, {
      data: {
        titulo: 'Deletar compra',
        mensagem: `Deseja deletar a compra do ${compra.mercado} de ${this.calcularTotal(compra).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}? Essa ação não pode ser desfeita.`,
        textoBotaoConfirmar: 'Deletar',
        corBotaoConfirmar: 'warn'
      }
    });

    // afterClosed() é um Observable que emite quando o diálogo fecha
    // subscribe() "ouve" o resultado — true se confirmou, false se cancelou
    ref.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.compraService.removerDoHistorico(compra.id);
      }
    });
  }
}