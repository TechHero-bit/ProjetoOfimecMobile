import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { listClientes, updateCliente } from '@/src/services/cliente.service';
import { listOrdensServico } from '@/src/services/ordem-servico.service';
import { listVeiculos } from '@/src/services/veiculo.service';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import type { Cliente } from '@/src/types';

import AppHeader from '@/src/components/AppHeader';
import ClienteCard from '@/src/components/ClienteCard';
import FAB from '@/src/components/FAB';
import FilterChips, { FilterOption } from '@/src/components/FilterChips';
import SearchBar from '@/src/components/SearchBar';

type ClienteStatus = NonNullable<Cliente['status']>;

type ClienteWithDetails = Cliente & {
  veiculosCount: number;
  status: ClienteStatus;
  ultimaVisita: string;
};

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'todos', label: 'TODOS' },
  { id: 'ativo', label: 'ATIVOS' },
  { id: 'inativo', label: 'INATIVOS' },
  { id: 'inadimplente', label: 'INADIMPLENTES' },
];

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<ClienteWithDetails[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClienteWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<ClienteWithDetails | null>(null);
  const router = useRouter();

  const loadData = async () => {
    try {
      const [clientesData, veiculosData, ordensData] = await Promise.all([
        listClientes(),
        listVeiculos(),
        listOrdensServico()
      ]);

      const clientesDetalhes: ClienteWithDetails[] = clientesData.map(c => {
        // Count veiculos
        const veiculos = veiculosData.filter(v => v.clienteId === c.id);

        // Find ordens
        const ordens = ordensData.filter(o => o.clienteId === c.id);

        // Determine status
        let status: ClienteStatus = c.status || 'inativo';
        const temOsAtiva = ordens.some(o => (o.status as string) === 'pendente' || o.status === 'em_andamento');
        if (temOsAtiva && !c.status) {
          status = 'ativo';
        }

        // Last visit
        let ultimaVisita = 'N/A';
        if (ordens.length > 0) {
          const sortedOrdens = [...ordens].sort((a, b) => new Date(b.dataAbertura).getTime() - new Date(a.dataAbertura).getTime());
          const date = new Date(sortedOrdens[0].dataAbertura);
          ultimaVisita = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
        } else if (c.dataCadastro) {
          ultimaVisita = new Date(c.dataCadastro).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
        }

        return {
          ...c,
          veiculosCount: veiculos.length,
          status,
          ultimaVisita
        };
      });

      setClientes(clientesDetalhes);
      applyFilters(clientesDetalhes, searchQuery, selectedFilter);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const applyFilters = (data: ClienteWithDetails[], query: string, filter: string) => {
    let result = data;

    // Filter by status
    if (filter !== 'todos') {
      result = result.filter(c => c.status === filter);
    }

    // Filter by query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(c =>
        c.nome.toLowerCase().includes(lowerQuery) ||
        c.cpf.includes(lowerQuery) ||
        (c.telefone && c.telefone.includes(lowerQuery))
      );
    }

    setFilteredClientes(result);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(clientes, text, selectedFilter);
  };

  const handleFilterSelect = (id: string) => {
    setSelectedFilter(id);
    applyFilters(clientes, searchQuery, id);
  };

  const closeStatusModal = () => {
    setStatusModalVisible(false);
    setSelectedCliente(null);
  };

  const handleUpdateStatus = async (newStatus: ClienteStatus) => {
    if (!selectedCliente) return;

    const cliente = selectedCliente;
    closeStatusModal();

    if (cliente.status === newStatus) return;

    const previousClientes = clientes;
    const nextClientes = clientes.map((item) =>
      item.id === cliente.id ? { ...item, status: newStatus } : item
    );

    setClientes(nextClientes);
    applyFilters(nextClientes, searchQuery, selectedFilter);
    setLoading(true);

    try {
      const updated = await updateCliente(cliente.id, { status: newStatus });
      const committedClientes = nextClientes.map((item) =>
        item.id === cliente.id ? { ...item, ...updated, status: updated.status || newStatus } : item
      );
      setClientes(committedClientes);
      applyFilters(committedClientes, searchQuery, selectedFilter);
    } catch (err) {
      console.error(err);
      setClientes(previousClientes);
      applyFilters(previousClientes, searchQuery, selectedFilter);
      Alert.alert('Erro', err instanceof Error ? err.message : 'Não foi possível atualizar o status do cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <AppHeader />

      <View style={styles.headerArea}>
        <Text style={styles.title}>Clientes</Text>
        <Text style={styles.subtitle}>Gerenciamento e histórico de clientes cadastrados.</Text>
      </View>

      <View style={styles.searchArea}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Buscar cliente..."
          rightIcon="filter"
        />
      </View>

      <View style={styles.filterArea}>
        <FilterChips
          options={FILTER_OPTIONS}
          selectedId={selectedFilter}
          onSelect={handleFilterSelect}
        />
      </View>

      <FlatList
        data={filteredClientes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <ClienteCard
            nome={item.nome}
            telefone={item.telefone}
            veiculosCount={item.veiculosCount}
            ultimaVisita={item.ultimaVisita}
            status={item.status}
            onPress={() => router.push(`/(tabs)/clientes/${item.id}`)}
            onStatusPress={() => {
              setSelectedCliente(item);
              setStatusModalVisible(true);
            }}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>
              {searchQuery ? `Não encontramos resultados para "${searchQuery}"` : 'Nenhum cliente cadastrado.'}
            </Text>
          ) : null
        }
      />

      <FAB icon="add" onPress={() => router.push('/(tabs)/clientes/new')} />

      <Modal
        visible={statusModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeStatusModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeStatusModal} />
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Alterar Status</Text>

            <Pressable
              style={[styles.modalOption, selectedCliente?.status === 'ativo' && styles.modalOptionActive]}
              onPress={() => handleUpdateStatus('ativo')}
            >
              <Text style={[styles.modalOptionText, selectedCliente?.status === 'ativo' && { color: COLORS.primaryContainer }]}>Ativo</Text>
            </Pressable>

            <Pressable
              style={[styles.modalOption, selectedCliente?.status === 'inativo' && styles.modalOptionActive]}
              onPress={() => handleUpdateStatus('inativo')}
            >
              <Text style={[styles.modalOptionText, selectedCliente?.status === 'inativo' && { color: COLORS.primaryContainer }]}>Inativo</Text>
            </Pressable>

            <Pressable
              style={[styles.modalOption, selectedCliente?.status === 'inadimplente' && styles.modalOptionActive]}
              onPress={() => handleUpdateStatus('inadimplente')}
            >
              <Text style={[styles.modalOptionText, selectedCliente?.status === 'inadimplente' && { color: COLORS.primaryContainer }]}>Inadimplente</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  headerArea: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },
  searchArea: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
  },
  filterArea: {
    marginBottom: SPACING.sm,
  },
  list: {
    padding: SPACING.md,
    paddingTop: 0,
    paddingBottom: 100,
    gap: SPACING.md,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: SPACING.xl,
  },
  modalContent: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },
  modalOption: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
  },
  modalOptionActive: {
    backgroundColor: `${COLORS.primaryContainer}20`,
  },
  modalOptionText: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
  }
});
