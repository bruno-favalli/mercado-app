// ============================================
// MERCADOS-FAVORITOS SERVICE
// Gerencia a lista de mercados favoritos do usuário.
// Persiste no localStorage via effect().
// ============================================
import { Injectable, signal, effect } from '@angular/core';

const STORAGE_KEY = 'mercados_favoritos';

const PADROES = ['Tauste', 'Assaí', 'Shibatta', 'Carrefour', 'Nagumo', 'Semmar'];

@Injectable({
  providedIn: 'root'
})
export class MercadosFavoritosService {

  // Signal público — qualquer componente pode ler, mas só o serviço escreve
  // O tipo é string[] — lista de nomes dos mercados
  // Inicializa chamando carregar(), que lê o localStorage
  readonly favoritos = signal<string[]>(this.carregar());

  constructor() {
    // effect() observa o signal favoritos e persiste automaticamente
    // É executado na criação E a cada mudança do signal
    effect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.favoritos()));
    });
  }

  adicionar(nome: string): void {
    const nomeTrimado = nome.trim();

    // trim() remove espaços do início e fim: '  Tauste  ' → 'Tauste'
    // Validações: não adiciona vazio nem duplicata (ignora maiúsculas/minúsculas)
    if (!nomeTrimado) return;

    const jaExiste = this.favoritos().some(
      m => m.toLowerCase() === nomeTrimado.toLowerCase()
    );
    if (jaExiste) return;

    // update() recebe uma função: o valor atual entra, o novo valor sai
    // O spread [...lista, nomeTrimado] cria um NOVO array — não modifica o existente
    // Isso é importante: signals detectam mudança por referência
    this.favoritos.update(lista => [...lista, nomeTrimado]);
  }

  remover(nome: string): void {
    this.favoritos.update(lista => lista.filter(m => m !== nome));
  }

  private carregar(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Primeira vez usando o app: retorna os padrões
      // O spread [...PADROES] cria uma cópia — nunca mutamos a constante original
      if (!raw) return [...PADROES];
      return JSON.parse(raw);
    } catch {
      return [...PADROES];
    }
  }
}
