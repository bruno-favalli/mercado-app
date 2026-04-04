// ============================================
// FORM-PRODUTO COMPONENT — Componente filho
// Reutilizável para adicionar E editar produto.
// Recebe dados via @Input e emite eventos via @Output.
// ============================================
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { signal } from '@angular/core';
import { NgxCurrencyDirective } from 'ngx-currency';
import { CompraService } from '../../services/compra';
import { Produto } from '../../models/compra.model';

@Component({
  selector: 'app-form-produto',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    NgxCurrencyDirective,
  ],
  templateUrl: './form-produto.html',
  styleUrl: './form-produto.scss'
})
export class FormProduto implements OnChanges {

  private fb = inject(FormBuilder);
  private compraService = inject(CompraService);

  // @Input — recebe o produto a editar do componente pai
  // Quando é null, o formulário está em modo "adicionar"
  // Quando tem valor, está em modo "editar"
  @Input() produtoEditando: Produto | null = null;

  // @Output — emite evento quando o usuário salva o formulário
  // O pai escuta esse evento para adicionar ou atualizar o produto
  @Output() salvo = new EventEmitter<Omit<Produto, 'id'>>();

  // @Output — emite evento quando o usuário cancela a edição
  @Output() cancelado = new EventEmitter<void>();

  // Sugestões do autocomplete
  sugestoes = signal<string[]>([]);

  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(2)]],
    quantidade: [1, [Validators.required, Validators.min(1)]],
    valorUnitario: [null, [Validators.required, Validators.min(0.01)]]
  });

  // OnChanges é um lifecycle hook — executado sempre que um @Input muda
  // Quando o pai passa um produto diferente, atualizamos o formulário
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['produtoEditando'] && this.produtoEditando) {
      // patchValue() preenche os campos do formulário com os dados recebidos
      this.form.patchValue({
        nome: this.produtoEditando.nome,
        quantidade: this.produtoEditando.quantidade,
        valorUnitario: this.produtoEditando.valorUnitario
      });
    }

    // Se passou para null (cancelou edição), limpa o formulário
    if (changes['produtoEditando'] && !this.produtoEditando) {
      this.form.reset({ quantidade: 1 });
    }
  }

  // Chamado a cada tecla no campo nome — busca sugestões
  onNomeInput(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.sugestoes.set(this.compraService.getSugestoes(valor));
  }

  // Seleciona uma sugestão do autocomplete
  selecionarSugestao(sugestao: string): void {
    this.form.patchValue({ nome: sugestao });
    this.sugestoes.set([]);
  }

  // Salva o formulário — emite o evento para o pai tratar
  salvar(): void {
    if (this.form.invalid) return;

    const { nome, quantidade, valorUnitario } = this.form.value;

    // Emite os dados para o pai via @Output
    this.salvo.emit({
      nome,
      quantidade: Number(quantidade),
      valorUnitario: Number(valorUnitario)
    });

    // Se estava editando, limpa após salvar
    if (!this.produtoEditando) {
      this.form.reset({ quantidade: 1 });
    }

    this.sugestoes.set([]);
  }

  // Cancela a edição — emite evento para o pai fechar o modo edição
  cancelar(): void {
    this.form.reset({ quantidade: 1 });
    this.sugestoes.set([]);
    this.cancelado.emit();
  }

  // Modo atual do formulário — usado no template para mudar textos
  get modoEdicao(): boolean {
    return this.produtoEditando !== null;
  }
}