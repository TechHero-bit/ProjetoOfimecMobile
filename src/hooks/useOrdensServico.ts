import { listOrdensServico, createOrdemServico as svcCreate, deleteOrdemServico as svcDelete, getOrdemServico as svcGet, updateOrdemServico as svcUpdate } from '@/src/services/ordem-servico.service';
import type { OrdemServico } from '@/src/types';
import { useEffect, useState } from 'react';

export function useOrdensServico() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await listOrdensServico();
      setOrdens(data);
    } finally {
      setLoading(false);
    }
  }

  async function createOrdem(payload: Omit<OrdemServico, 'id' | 'dataAbertura' | 'valorTotal' | 'dataAtualizacao'>) {
    setLoading(true);
    try {
      const created = await svcCreate(payload as any);
      setOrdens((prev) => [created, ...prev]);
      return created;
    } finally {
      setLoading(false);
    }
  }

  async function updateOrdem(id: number, payload: Partial<OrdemServico>) {
    setLoading(true);
    try {
      const updated = await svcUpdate(id, payload as any);
      setOrdens((prev) => prev.map((o) => (o.id === id ? updated : o)));
      return updated;
    } finally {
      setLoading(false);
    }
  }

  async function deleteOrdem(id: number) {
    setLoading(true);
    try {
      await svcDelete(id);
      setOrdens((prev) => prev.filter((o) => o.id !== id));
    } finally {
      setLoading(false);
    }
  }

  async function getOrdem(id: number) {
    setLoading(true);
    try {
      return await svcGet(id);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return { ordens, loading, refresh, createOrdem, updateOrdem, deleteOrdem, getOrdem };
}
