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
  cidade?: string;
  estado?: string;
  cep?: string;
  status?: 'ativo' | 'inativo' | 'inadimplente';
  dataCadastro?: Date;
  dataAtualizacao?: Date;
}

// ========== Endereço CEP (resposta padronizada) ==========
export type CepErrorCode = 'INVALID_CEP' | 'NOT_FOUND' | 'CONNECTION_ERROR';

export interface EnderecoCep {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  latitude?: number;
  longitude?: number;
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
  combustivel?: string;
  quilometragem: number;
  dataCadastro?: Date;
  dataAtualizacao?: Date;
}

// ========== Ordem de Serviço ==========
export type StatusOS = 'inadimplente' | 'em_andamento' | 'concluida' | 'cancelada';

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
  numeroOs?: string;
  descricaoProblema: string;
  servicos: ServicoItem[];
  status: StatusOS;
  dataAbertura: Date;
  dataConclusao?: Date;
  dataEntrega?: Date;
  dataAtualizacao?: Date;
  observacoes: string;
  valorTotal: number;
  situacao?: string;
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
  inadimplente: 'Inadimplente',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

export const STATUS_ICONS: Record<StatusOS, string> = {
  inadimplente: 'warning-outline',
  em_andamento: 'reload-outline',
  concluida: 'checkmark-circle-outline',
  cancelada: 'close-circle-outline',
};
