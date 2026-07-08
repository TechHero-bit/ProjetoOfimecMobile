import type { OrdemServico } from '@/src/types';
import { supabase } from './supabase';

type OrdemServicoPayload = Omit<OrdemServico, 'id'>;

function normalizeOrdem(item: Record<string, unknown>): OrdemServico {
  return {
    id: Number(item.id),
    clienteId: Number(item.clienteId),
    clienteNome: item.clienteNome ? String(item.clienteNome) : undefined,
    veiculoId: Number(item.veiculoId),
    veiculoInfo: item.veiculoInfo ? String(item.veiculoInfo) : undefined,
    descricaoProblema: String(item.descricaoProblema ?? ''),
    servicos: Array.isArray(item.servicos)
      ? item.servicos.map((service) => ({
          descricao: String((service as Record<string, unknown>).descricao ?? ''),
          valor: Number((service as Record<string, unknown>).valor ?? 0),
        }))
      : [],
    status: String(item.status ?? 'pendente') as OrdemServico['status'],
    dataAbertura: item.dataAbertura ? new Date(String(item.dataAbertura)) : new Date(),
    dataConclusao: item.dataConclusao ? new Date(String(item.dataConclusao)) : undefined,
    observacoes: String(item.observacoes ?? ''),
    valorTotal: Number(item.valorTotal ?? 0),
  };
}

export async function listOrdensServico() {
  const { data, error } = await supabase.from('ordens_servico').select('*').order('id', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((item) => normalizeOrdem(item as Record<string, unknown>));
}

export async function getOrdemServico(id: number) {
  const { data, error } = await supabase.from('ordens_servico').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? normalizeOrdem(data as Record<string, unknown>) : null;
}

export async function createOrdemServico(payload: OrdemServicoPayload) {
  const { data, error } = await supabase.from('ordens_servico').insert([payload]).select().single();
  if (error) throw error;
  return normalizeOrdem(data as Record<string, unknown>);
}

export async function updateOrdemServico(id: number, payload: Partial<OrdemServicoPayload>) {
  const { data, error } = await supabase.from('ordens_servico').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return normalizeOrdem(data as Record<string, unknown>);
}

export async function deleteOrdemServico(id: number) {
  const { error } = await supabase.from('ordens_servico').delete().eq('id', id);
  if (error) throw error;
}
