export interface Produto{
    id: string;
    nome: string;
    quantidade: number;
    valorUnitario: number;
}

export interface Compra{
    id: string;
    mercado: string;
    orcamento?: number; // opcional — compra sem orçamento é válida
    dataInicio: Date;
    dataFim?: Date;
    produtos: Produto[];
    status: 'ativa' | 'finalizada';
}