import { Component, inject, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { CompraService } from '../../services/compra';
import { filter } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatIconModule, MatRippleModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {

  private router = inject(Router);
  private compraService = inject(CompraService);

  // Converte o Observable do Router em Signal
  private rotaAtual = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  temCompraAtiva = this.compraService.temCompraAtiva;

  isAtivo(rota: string): boolean {
    return this.rotaAtual() === rota;
  }

  navegar(rota: string): void {
    this.router.navigate([rota]);
  }
}