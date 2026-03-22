import { Injectable, signal, computed, effect } from '@angular/core';
import { Compra, Produto } from '../models/compra.model';

const STORAGE_KEY = 'mercado_historico';

const STORAGE_VERSION = 'v1';

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

  removerDoHistorico(compraId: string): void {
    // filter() cria nova lista excluindo a compra com o id informado
    // O effect() salva automaticamente no localStorage
    this.historico.update(h => h.filter(c => c.id !== compraId));
  }
  // localStorage
  private salvarHistorico(historico: Compra[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        version: STORAGE_VERSION, // Salva a versão junto com os dados
        dados: historico
      }));
    } catch (error) {
      console.error('Erro ao salvar histórico:', error);
    }
  }

  private carregarHistorico(): Compra[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return []; // Primeira vez — retorna vazio

      const parsed = JSON.parse(raw);

      // Verificação de versão — se dados são de versão antiga,
      // descarta para evitar erros de estrutura incompatível
      if (!parsed.version || parsed.version !== STORAGE_VERSION) {
        localStorage.removeItem(STORAGE_KEY);
        return [];
      }

      // JSON.parse converte Date para string — precisamos reconverter
      // map() percorre cada compra e recria os objetos Date corretamente
      return parsed.dados.map((compra: Compra) => ({
        ...compra,
        dataInicio: new Date(compra.dataInicio),
        // dataFim é opcional — só converte se existir
        dataFim: compra.dataFim ? new Date(compra.dataFim) : undefined
      }));

    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      return []; // Em caso de erro, começa com histórico vazio
    }
  }
}