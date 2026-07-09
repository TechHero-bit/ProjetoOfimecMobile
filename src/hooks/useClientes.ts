import { listClientes, createCliente as svcCreate, deleteCliente as svcDelete, getCliente as svcGet, updateCliente as svcUpdate } from '@/src/services/cliente.service';
import type { Cliente } from '@/src/types';
import { useEffect, useState } from 'react';

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const data = await listClientes();
      setClientes(data);
    } finally {
      setLoading(false);
    }
  }

  async function createCliente(payload: Omit<Cliente, 'id' | 'dataCadastro' | 'dataAtualizacao'>) {
    setLoading(true);
    try {
      const created = await svcCreate(payload as any);
      setClientes((prev) => [created, ...prev]);
      return created;
    } finally {
      setLoading(false);
    }
  }

  async function updateCliente(id: number, payload: Partial<Cliente>) {
    setLoading(true);
    try {
      const updated = await svcUpdate(id, payload as any);
      setClientes((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    } finally {
      setLoading(false);
    }
  }

  async function deleteCliente(id: number) {
    setLoading(true);
    try {
      await svcDelete(id);
      setClientes((prev) => prev.filter((c) => c.id !== id));
    } finally {
      setLoading(false);
    }
  }

  async function getCliente(id: number) {
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

  return { clientes, loading, refresh, createCliente, updateCliente, deleteCliente, getCliente };
}
