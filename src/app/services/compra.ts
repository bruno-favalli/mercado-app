import { Injectable, signal, computed, effect } from '@angular/core';
import { Compra, Produto } from '../models/compra.model';

const STORAGE_KEY = 'mercado_historico';

@Injectable({
  providedIn: 'root'
})
export class CompraService {

  constructor() {
    effect(() => {
      this.salvarHistorico(this.historico());
    });
  }

  private compraAtiva = signal<Compra | null>(null);
  private historico = signal<Compra[]>(this.carregarHistorico());

  readonly totalCompraAtiva = computed(() => {
    const compra = this.compraAtiva();
    if (!compra) return 0;
    return compra.produtos.reduce((total, produto) => {
      return total + (produto.quantidade * produto.valorUnitario);
    }, 0);
  });

  readonly temCompraAtiva = computed(() => this.compraAtiva() !== null);

  getCompraAtiva() {
    return this.compraAtiva.asReadonly();
  }

  getHistorico() {
    return this.historico.asReadonly();
  }

  iniciarCompra(mercado: string): void {
    const novaCompra: Compra = {
      id: crypto.randomUUID(),
      mercado,
      dataInicio: new Date(),
      produtos: [],
      status: 'ativa'
    };
    this.compraAtiva.set(novaCompra);
  }

  adicionarProduto(produto: Omit<Produto, 'id'>): void {
    const compra = this.compraAtiva();
    if (!compra) return;

    const novoProduto: Produto = {
      ...produto,
      id: crypto.randomUUID()
    };

    this.compraAtiva.update(c => ({
      ...c!,
      produtos: [...c!.produtos, novoProduto]
    }));
  }

  removerProduto(produtoId: string): void {
    this.compraAtiva.update(c => ({
      ...c!,
      produtos: c!.produtos.filter(p => p.id !== produtoId)
    }));
  }

  finalizarCompra(): void {
    const compra = this.compraAtiva();
    if (!compra) return;
  
    const compraFinalizada: Compra = {
      ...compra,
      status: 'finalizada',
      dataFim: new Date()
    };
  
    this.historico.update(h => [compraFinalizada, ...h]);
    this.compraAtiva.set(null);
  }

  cancelarCompra(): void {
    this.compraAtiva.set(null);
  }

  // localStorage
  private salvarHistorico(historico: Compra[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historico));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }

  private carregarHistorico(): Compra[] {
    try {
      const dados = localStorage.getItem(STORAGE_KEY);
      if (!dados) return [];

      const historico = JSON.parse(dados) as Compra[];

      // Reconverte strings de volta para Date
      return historico.map(compra => ({
        ...compra,
        dataInicio: new Date(compra.dataInicio),
        dataFim: compra.dataFim ? new Date(compra.dataFim) : undefined
      }));

    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      return [];
    }
  }
}
