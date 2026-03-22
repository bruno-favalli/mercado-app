import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface DialogoConfirmacaoData {
  titulo: string;
  mensagem: string;
  textoBotaoConfirmar: string;
  corBotaoConfirmar?: 'warn' | 'primary';
}

@Component({
  selector: 'app-dialogo-confirmacao',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './dialogo-confirmacao.html',
  styleUrl: './dialogo-confirmacao.scss'
})
export class DialogoConfirmacaoComponent {
  dialogRef = inject(MatDialogRef<DialogoConfirmacaoComponent>);
  data: DialogoConfirmacaoData = inject(MAT_DIALOG_DATA);

  confirmar(): void {
    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}