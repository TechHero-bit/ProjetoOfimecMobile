import { listVeiculos, createVeiculo as svcCreate, deleteVeiculo as svcDelete, getVeiculo as svcGet, updateVeiculo as svcUpdate } from '@/src/services/veiculo.service';
import type { Veiculo } from '@/src/types';
import { useEffect, useState } from 'react';

export function useVeiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await listVeiculos();
      setVeiculos(data);
    } finally {
      setLoading(false);
    }
  }

  async function createVeiculo(payload: Omit<Veiculo, 'id' | 'dataCadastro' | 'dataAtualizacao'>) {
    setLoading(true);
    try {
      const created = await svcCreate(payload as any);
      setVeiculos((prev) => [created, ...prev]);
      return created;
    } finally {
      setLoading(false);
    }
  }

  async function updateVeiculo(id: number, payload: Partial<Veiculo>) {
    setLoading(true);
    try {
      const updated = await svcUpdate(id, payload as any);
      setVeiculos((prev) => prev.map((v) => (v.id === id ? updated : v)));
      return updated;
    } finally {
      setLoading(false);
    }
  }

  async function deleteVeiculo(id: number) {
    setLoading(true);
    try {
      await svcDelete(id);
      setVeiculos((prev) => prev.filter((v) => v.id !== id));
    } finally {
      setLoading(false);
    }
  }

  async function getVeiculo(id: number) {
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

  return { veiculos, loading, refresh, createVeiculo, updateVeiculo, deleteVeiculo, getVeiculo };
}
