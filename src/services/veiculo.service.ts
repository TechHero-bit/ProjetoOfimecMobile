import type { Veiculo } from '@/src/types';
import { supabase } from './supabase';

type VeiculoPayload = Omit<Veiculo, 'id'>;

function normalizeVeiculo(item: Record<string, unknown>): Veiculo {
  return {
    id: Number(item.id),
    clienteId: Number(item.clienteId),
    clienteNome: item.clienteNome ? String(item.clienteNome) : undefined,
    marca: String(item.marca ?? ''),
    modelo: String(item.modelo ?? ''),
    ano: Number(item.ano ?? 0),
    placa: String(item.placa ?? ''),
    cor: String(item.cor ?? ''),
    quilometragem: Number(item.quilometragem ?? 0),
  };
}

export async function listVeiculos() {
  const { data, error } = await supabase.from('veiculos').select('*').order('id', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((item) => normalizeVeiculo(item as Record<string, unknown>));
}

export async function getVeiculo(id: number) {
  const { data, error } = await supabase.from('veiculos').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? normalizeVeiculo(data as Record<string, unknown>) : null;
}

export async function createVeiculo(payload: VeiculoPayload) {
  const { data, error } = await supabase.from('veiculos').insert([payload]).select().single();
  if (error) throw error;
  return normalizeVeiculo(data as Record<string, unknown>);
}

export async function updateVeiculo(id: number, payload: Partial<VeiculoPayload>) {
  const { data, error } = await supabase.from('veiculos').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return normalizeVeiculo(data as Record<string, unknown>);
}

export async function deleteVeiculo(id: number) {
  const { error } = await supabase.from('veiculos').delete().eq('id', id);
  if (error) throw error;
}
