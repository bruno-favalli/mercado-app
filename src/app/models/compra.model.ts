export interface Produto{
    id: string;
    nome: string;
    quantidade: number;
    valorUnitario: number;
}

export interface Compra{
    id: string;
    mercado: string;
    dataInicio: Date;
    dataFim?: Date;
    produtos: Produto[];
    status: 'ativa' | 'finalizada';
}