/**
 * Tipos/Interfaces — OfimecMobile
 * Traduzidos dos models do Projeto Angular (Projeto B)
 */

// ========== Cliente ==========
export interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  endereco: string;
  dataCadastro?: Date;
}

// ========== Veículo ==========
export interface Veiculo {
  id: number;
  clienteId: number;
  clienteNome?: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
  cor: string;
  quilometragem: number;
}

// ========== Ordem de Serviço ==========
export type StatusOS = 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';

export interface ServicoItem {
  descricao: string;
  valor: number;
}

export interface OrdemServico {
  id: number;
  clienteId: number;
  clienteNome?: string;
  veiculoId: number;
  veiculoInfo?: string;
  descricaoProblema: string;
  servicos: ServicoItem[];
  status: StatusOS;
  dataAbertura: Date;
  dataConclusao?: Date;
  observacoes: string;
  valorTotal: number;
}

// ========== Dashboard ==========
export interface DashboardStats {
  totalClientes: number;
  totalVeiculos: number;
  totalOrdens: number;
  ordensPendentes: number;
  ordensEmAndamento: number;
  ordensConcluidas: number;
  receitaTotal: number;
}

// ========== Status Helpers ==========
export const STATUS_LABELS: Record<StatusOS, string> = {
  pendente: 'Pendente',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export const STATUS_ICONS: Record<StatusOS, string> = {
  pendente: 'time-outline',
  em_andamento: 'reload-outline',
  concluida: 'checkmark-circle-outline',
  cancelada: 'close-circle-outline',
};
