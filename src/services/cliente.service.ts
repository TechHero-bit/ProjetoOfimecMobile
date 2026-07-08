import type { Cliente } from '@/src/types';
import { supabase } from './supabase';

type ClientePayload = Omit<Cliente, 'id' | 'dataCadastro'> & {
  dataCadastro?: string | null;
};

function normalizeCliente(item: Record<string, unknown>): Cliente {
  return {
    id: Number(item.id),
    nome: String(item.nome ?? ''),
    cpf: String(item.cpf ?? ''),
    telefone: String(item.telefone ?? ''),
    email: String(item.email ?? ''),
    endereco: String(item.endereco ?? ''),
    dataCadastro: item.dataCadastro ? new Date(String(item.dataCadastro)) : undefined,
  };
}

export async function listClientes() {
  const { data, error } = await supabase.from('clientes').select('*').order('id', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((item) => normalizeCliente(item as Record<string, unknown>));
}

export async function getCliente(id: number) {
  const { data, error } = await supabase.from('clientes').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? normalizeCliente(data as Record<string, unknown>) : null;
}

export async function createCliente(payload: ClientePayload) {
  const { data, error } = await supabase
    .from('clientes')
    .insert([{ ...payload, dataCadastro: payload.dataCadastro ?? new Date().toISOString() }])
    .select()
    .single();
  if (error) throw error;
  return normalizeCliente(data as Record<string, unknown>);
}

export async function updateCliente(id: number, payload: Partial<ClientePayload>) {
  const { data, error } = await supabase.from('clientes').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return normalizeCliente(data as Record<string, unknown>);
}

export async function deleteCliente(id: number) {
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) throw error;
}
