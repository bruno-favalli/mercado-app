import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { CompraService } from '../../services/compra';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {

  private router = inject(Router);
  compraService = inject(CompraService);

  novaCompra(): void {
    this.router.navigate(['/compra']);
  }

  verHistorico(): void {
    this.router.navigate(['/historico']);
  }
}
