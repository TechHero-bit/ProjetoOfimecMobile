import type { Veiculo } from '@/src/types';
import { supabase } from './supabase';

type VeiculoPayload = Omit<Veiculo, 'id' | 'dataCadastro' | 'dataAtualizacao'>;

function mapDbToModel(item: Record<string, any>): Veiculo {
  return {
    id: Number(item.id),
    clienteId: Number(item.cliente_id),
    clienteNome: item.clientes?.nome ? String(item.clientes.nome) : undefined,
    marca: String(item.marca ?? ''),
    modelo: String(item.modelo ?? ''),
    ano: Number(item.ano ?? 0),
    placa: String(item.placa ?? ''),
    cor: String(item.cor ?? ''),
    combustivel: item.combustivel ? String(item.combustivel) : undefined,
    quilometragem: Number(item.km_atual ?? 0),
    dataCadastro: item.data_criacao ? new Date(String(item.data_criacao)) : undefined,
    dataAtualizacao: item.data_atualizacao ? new Date(String(item.data_atualizacao)) : undefined,
  };
}

function mapModelToDb(payload: Partial<VeiculoPayload>): Record<string, any> {
  const dbData: Record<string, any> = { ...payload };
  if (payload.clienteId !== undefined) {
    dbData.cliente_id = payload.clienteId;
    delete dbData.clienteId;
  }
  if (payload.quilometragem !== undefined) {
    dbData.km_atual = payload.quilometragem;
    delete dbData.quilometragem;
  }
  delete dbData.clienteNome;
  return dbData;
}

export async function listVeiculos() {
  const { data, error } = await supabase.from('veiculos').select('*, clientes(nome)').order('id', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapDbToModel);
}

export async function getVeiculo(id: number) {
  const { data, error } = await supabase.from('veiculos').select('*, clientes(nome)').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapDbToModel(data) : null;
}

export async function createVeiculo(payload: VeiculoPayload) {
  const dbData = mapModelToDb(payload);
  const { data, error } = await supabase
    .from('veiculos')
    .insert([dbData])
    .select('*, clientes(nome)')
    .single();
  if (error) throw error;
  return mapDbToModel(data);
}

export async function updateVeiculo(id: number, payload: Partial<VeiculoPayload>) {
  const dbData = mapModelToDb(payload);
  dbData.data_atualizacao = new Date().toISOString();

  const { data, error } = await supabase
    .from('veiculos')
    .update(dbData)
    .eq('id', id)
    .select('*, clientes(nome)')
    .single();
  if (error) throw error;
  return mapDbToModel(data);
}

export async function deleteVeiculo(id: number) {
  const { error } = await supabase.from('veiculos').delete().eq('id', id);
  if (error) throw error;
}
