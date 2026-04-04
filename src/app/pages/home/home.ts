import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { CompraService } from '../../services/compra';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    CurrencyPipe,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  private router = inject(Router);
  compraService = inject(CompraService);

  total = this.compraService.totalCompraAtiva;

  // ngOnInit é executado uma vez, logo após o componente ser criado
  // É o lugar certo para lógica de inicialização como redirecionamentos
  ngOnInit(): void {
    if (this.compraService.temCompraAtiva()) {
      this.router.navigate(['/compra']);
    }
  }

  novaCompra(): void {
    this.router.navigate(['/compra']);
  }

  verHistorico(): void {
    this.router.navigate(['/historico']);
  }
}
