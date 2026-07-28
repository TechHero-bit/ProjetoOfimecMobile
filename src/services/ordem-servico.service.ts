import type { OrdemServico, StatusOS } from '@/src/types';
import { supabase } from './supabase';

type OrdemServicoPayload = Omit<OrdemServico, 'id' | 'dataAbertura' | 'dataAtualizacao'>;

function mapStatusDbToApi(dbStatus: string): StatusOS {
  if (!dbStatus) return 'pendente';
  const status = dbStatus.toUpperCase();
  if (status === 'ABERTA' || status === 'PENDENTE') return 'pendente';
  if (status === 'EM_ANDAMENTO') return 'em_andamento';
  if (status === 'CONCLUIDA') return 'concluida';
  if (status === 'CANCELADA') return 'cancelada';
  return dbStatus.toLowerCase() as StatusOS;
}

function mapStatusApiToDb(apiStatus: string): string {
  if (!apiStatus) return 'ABERTA';
  const status = apiStatus.toLowerCase();
  if (status === 'pendente') return 'ABERTA';
  if (status === 'em_andamento') return 'EM_ANDAMENTO';
  if (status === 'concluida') return 'CONCLUIDA';
  if (status === 'cancelada') return 'CANCELADA';
  return apiStatus.toUpperCase();
}

function mapDbToModel(dbOS: Record<string, any>): OrdemServico {
  return {
    id: Number(dbOS.id),
    clienteId: Number(dbOS.cliente_id),
    clienteNome: dbOS.clientes?.nome ? String(dbOS.clientes.nome) : undefined,
    veiculoId: Number(dbOS.veiculo_id),
    veiculoInfo: dbOS.veiculos ? `${dbOS.veiculos.marca} ${dbOS.veiculos.modelo}` : undefined,
    numeroOs: dbOS.numero_os ? String(dbOS.numero_os) : undefined,
    descricaoProblema: String(dbOS.descricao ?? ''),
    servicos: Array.isArray(dbOS.itens_servico)
      ? dbOS.itens_servico.map((item: any) => ({
          descricao: String(item.descricao ?? ''),
          valor: Number(item.valor ?? 0),
        }))
      : [],
    status: mapStatusDbToApi(dbOS.status),
    dataAbertura: dbOS.data_criacao ? new Date(String(dbOS.data_criacao)) : new Date(),
    dataConclusao: dbOS.data_conclusao ? new Date(String(dbOS.data_conclusao)) : undefined,
    dataEntrega: dbOS.data_entrega ? new Date(String(dbOS.data_entrega)) : undefined,
    dataAtualizacao: dbOS.data_atualizacao ? new Date(String(dbOS.data_atualizacao)) : undefined,
    observacoes: String(dbOS.observacoes ?? ''),
    valorTotal: Number(dbOS.valor_total ?? 0),
    situacao: String(dbOS.situacao ?? ''),
  };
}

async function appendItensToOrdens(ordensData: any | any[]): Promise<OrdemServico[]> {
  if (!ordensData) return [];
  const ordensList = Array.isArray(ordensData) ? ordensData : [ordensData];
  if (ordensList.length === 0) return [];

  const ids = ordensList.map((o) => o.id);
  const { data: itens, error: itensError } = await supabase
    .from('itens_servico')
    .select('ordem_servico_id, descricao, valor')
    .in('ordem_servico_id', ids);

  if (itensError) throw itensError;

  return ordensList.map((o) => {
    const osItens = (itens || []).filter((i) => i.ordem_servico_id === o.id);
    return mapDbToModel({ ...o, itens_servico: osItens });
  });
}

export async function listOrdensServico() {
  const { data, error } = await supabase
    .from('ordens_servico')
    .select('*, clientes(nome), veiculos(marca, modelo)')
    .order('id', { ascending: false });
  if (error) throw error;
  return appendItensToOrdens(data);
}

export async function getOrdemServico(id: number) {
  const { data, error } = await supabase
    .from('ordens_servico')
    .select('*, clientes(nome), veiculos(marca, modelo)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const res = await appendItensToOrdens(data);
  return res[0];
}

export async function createOrdemServico(payload: OrdemServicoPayload) {
  const valorTotal = payload.valorTotal !== undefined ? payload.valorTotal : (payload.servicos ? payload.servicos.reduce((sum, s) => sum + s.valor, 0) : 0);
  const numeroOs = payload.numeroOs || `OS-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(100000 + Math.random() * 900000)}`;
  const statusDb = mapStatusApiToDb(payload.status || 'pendente');

  const { data: osData, error: osError } = await supabase
    .from('ordens_servico')
    .insert([{
      cliente_id: payload.clienteId,
      veiculo_id: payload.veiculoId,
      descricao: payload.descricaoProblema,
      observacoes: payload.observacoes,
      valor_total: valorTotal,
      situacao: payload.situacao || '',
      status: statusDb,
      numero_os: numeroOs,
      data_entrega: payload.dataEntrega ? payload.dataEntrega.toISOString() : null,
      data_criacao: new Date().toISOString(),
      data_atualizacao: new Date().toISOString(),
    }])
    .select()
    .single();

  if (osError) {
    console.error('Erro ao criar ordem de serviço:', osError);
    throw new Error(osError.message || JSON.stringify(osError));
  }

  const osId = osData.id;

  if (payload.servicos && payload.servicos.length > 0) {
    const itensToInsert = payload.servicos.map((s) => ({
      ordem_servico_id: osId,
      descricao: s.descricao,
      valor: s.valor,
    }));
    const { error: itemsError } = await supabase.from('itens_servico').insert(itensToInsert);
    if (itemsError) {
      console.error('Erro ao inserir itens da OS (revertendo criação):', itemsError);
      await supabase.from('ordens_servico').delete().eq('id', osId);
      throw new Error(itemsError.message || JSON.stringify(itemsError));
    }
  }

  const { data: finalOs, error: fetchError } = await supabase
    .from('ordens_servico')
    .select('*, clientes(nome), veiculos(marca, modelo)')
    .eq('id', osId)
    .single();
  if (fetchError) throw fetchError;

  const res = await appendItensToOrdens(finalOs);
  return res[0];
}

export async function updateOrdemServico(id: number, payload: Partial<OrdemServicoPayload>) {
  const updateData: Record<string, any> = {};
  if (payload.status) updateData.status = mapStatusApiToDb(payload.status);
  if (payload.status === 'concluida' && !payload.dataConclusao) {
    updateData.data_conclusao = new Date().toISOString();
  }
  if (payload.observacoes !== undefined) updateData.observacoes = payload.observacoes;
  if (payload.descricaoProblema !== undefined) updateData.descricao = payload.descricaoProblema;
  if (payload.situacao !== undefined) updateData.situacao = payload.situacao;
  if (payload.dataEntrega !== undefined) {
    updateData.data_entrega = payload.dataEntrega ? payload.dataEntrega.toISOString() : null;
  }
  
  if (payload.valorTotal !== undefined) {
    updateData.valor_total = payload.valorTotal;
  } else if (payload.servicos) {
    updateData.valor_total = payload.servicos.reduce((sum, s) => sum + s.valor, 0);
  }
  
  updateData.data_atualizacao = new Date().toISOString();

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase.from('ordens_servico').update(updateData).eq('id', id);
    if (error) throw error;
  }

  if (payload.servicos) {
    const { error: deleteError } = await supabase.from('itens_servico').delete().eq('ordem_servico_id', id);
    if (deleteError) {
      console.error('Erro ao deletar itens:', deleteError);
      throw deleteError;
    }

    if (payload.servicos.length > 0) {
      const itensToInsert = payload.servicos.map((s) => ({
        ordem_servico_id: id,
        descricao: s.descricao,
        valor: s.valor,
      }));
      const { error: insertError } = await supabase.from('itens_servico').insert(itensToInsert);
      if (insertError) {
        console.error('Erro ao inserir itens:', insertError);
        throw insertError;
      }
    }
  }

  const { data: finalOs, error: fetchError } = await supabase
    .from('ordens_servico')
    .select('*, clientes(nome), veiculos(marca, modelo)')
    .eq('id', id)
    .single();
    
  if (fetchError) {
    console.warn('Erro ao buscar OS atualizada:', fetchError);
    return { id, ...updateData } as any;
  }

  const res = await appendItensToOrdens(finalOs);
  return res[0];
}

export async function deleteOrdemServico(id: number) {
  const { error } = await supabase.from('ordens_servico').delete().eq('id', id);
  if (error) throw error;
}
