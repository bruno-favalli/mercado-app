import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CompraService } from '../../services/compra';
import { Compra } from '../../models/compra.model';

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

  private router = inject(Router);
  compraService = inject(CompraService);

  historico = this.compraService.getHistorico();

  calcularTotal(compra: Compra): number {
    return compra.produtos.reduce((total, p) => {
      return total + (p.quantidade * p.valorUnitario);
    }, 0);
  }

  novaCompra(): void {
    this.router.navigate(['/compra']);
  }

  voltar(): void {
    this.router.navigate(['/']);
  }
}