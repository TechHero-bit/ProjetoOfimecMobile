import type { Cliente } from '@/src/types';
import { supabase } from './supabase';

type ClientePayload = Omit<Cliente, 'id' | 'dataCadastro' | 'dataAtualizacao'>;

function mapDbToModel(item: Record<string, any>): Cliente {
  return {
    id: Number(item.id),
    nome: String(item.nome ?? ''),
    cpf: String(item.cpf ?? ''),
    telefone: String(item.telefone ?? ''),
    email: String(item.email ?? ''),
    endereco: String(item.endereco ?? ''),
    cidade: item.cidade ? String(item.cidade) : undefined,
    estado: item.estado ? String(item.estado) : undefined,
    cep: item.cep ? String(item.cep) : undefined,
    dataCadastro: item.data_criacao ? new Date(String(item.data_criacao)) : undefined,
    dataAtualizacao: item.data_atualizacao ? new Date(String(item.data_atualizacao)) : undefined,
  };
}

function mapModelToDb(payload: Partial<ClientePayload>): Record<string, any> {
  const dbData: Record<string, any> = { ...payload };
  return dbData; // As other fields are identical in name
}

export async function listClientes() {
  const { data, error } = await supabase.from('clientes').select('*').order('id', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapDbToModel);
}

export async function getCliente(id: number) {
  const { data, error } = await supabase.from('clientes').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapDbToModel(data) : null;
}

export async function createCliente(payload: ClientePayload) {
  const dbData = mapModelToDb(payload);
  const { data, error } = await supabase
    .from('clientes')
    .insert([dbData])
    .select()
    .single();
  if (error) throw error;
  return mapDbToModel(data);
}

export async function updateCliente(id: number, payload: Partial<ClientePayload>) {
  const dbData = mapModelToDb(payload);
  dbData.data_atualizacao = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('clientes')
    .update(dbData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return mapDbToModel(data);
}

export async function deleteCliente(id: number) {
  const { error } = await supabase.from('clientes').delete().eq('id', id);
  if (error) throw error;
}
