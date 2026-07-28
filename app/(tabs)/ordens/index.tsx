import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Text } from 'react-native';

import { listOrdensServico } from '@/src/services/ordem-servico.service';
import { listClientes } from '@/src/services/cliente.service';
import { listVeiculos } from '@/src/services/veiculo.service';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import type { OrdemServico, StatusOS } from '@/src/types';

import AppHeader from '@/src/components/AppHeader';
import SearchBar from '@/src/components/SearchBar';
import FilterChips, { FilterOption } from '@/src/components/FilterChips';
import OrdemCard from '@/src/components/OrdemCard';
import FAB from '@/src/components/FAB';

type OrdemWithDetails = OrdemServico & { 
  clienteNome?: string;
  veiculoDesc?: string;
};

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'todos', label: 'TODOS' },
  { id: 'inadimplente', label: 'INADIMPLENTES' },
  { id: 'em_andamento', label: 'EM ANDAMENTO' },
  { id: 'concluida', label: 'CONCLUÍDAS' },
];

export default function OrdensScreen() {
  const [ordens, setOrdens] = useState<OrdemWithDetails[]>([]);
  const [filteredOrdens, setFilteredOrdens] = useState<OrdemWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadData = async () => {
    try {
      const [ordensData, clientesData, veiculosData] = await Promise.all([
        listOrdensServico(),
        listClientes(),
        listVeiculos()
      ]);
      
      const clientesMap = new Map<number, string>();
      clientesData.forEach(c => clientesMap.set(c.id, c.nome));

      const veiculosMap = new Map<number, string>();
      veiculosData.forEach(v => veiculosMap.set(v.id, `${v.marca} ${v.modelo} (${v.placa})`));
      
      const ordensDetalhes = ordensData.map(o => ({
        ...o,
        clienteNome: o.clienteId ? clientesMap.get(o.clienteId) : undefined,
        veiculoDesc: o.veiculoId ? veiculosMap.get(o.veiculoId) : undefined
      }));
      
      // Ordenar por data (mais recentes primeiro)
      ordensDetalhes.sort((a, b) => {
        return new Date(b.dataAtualizacao || b.dataAbertura).getTime() - new Date(a.dataAtualizacao || a.dataAbertura).getTime();
      });

      setOrdens(ordensDetalhes);
      applyFilters(ordensDetalhes, searchQuery, selectedFilter);
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

  const applyFilters = (data: OrdemWithDetails[], query: string, filter: string) => {
    let result = data;
    
    // Filtro por status
    if (filter !== 'todos') {
      result = result.filter(o => o.status === filter);
    }

    // Filtro por texto
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(o => 
        o.id.toString().includes(lowerQuery) || 
        (o.clienteNome && o.clienteNome.toLowerCase().includes(lowerQuery)) ||
        (o.veiculoDesc && o.veiculoDesc.toLowerCase().includes(lowerQuery)) ||
        (o.numeroOs && o.numeroOs.toLowerCase().includes(lowerQuery))
      );
    }
    
    setFilteredOrdens(result);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    applyFilters(ordens, text, selectedFilter);
  };

  const handleFilterSelect = (id: string) => {
    setSelectedFilter(id);
    applyFilters(ordens, searchQuery, id);
  };

  return (
    <View style={styles.root}>
      <AppHeader />
      
      <View style={styles.headerArea}>
        <Text style={styles.title}>Ordens de Serviço</Text>
        <Text style={styles.subtitle}>Gerencie os serviços em andamento</Text>
      </View>

      <View style={styles.filterArea}>
        <FilterChips 
          options={FILTER_OPTIONS}
          selectedId={selectedFilter}
          onSelect={handleFilterSelect}
        />
      </View>

      <View style={styles.searchArea}>
        <SearchBar 
          value={searchQuery} 
          onChangeText={handleSearch} 
          placeholder="Buscar por placa ou cliente..." 
        />
      </View>

      <FlatList
        data={filteredOrdens}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <OrdemCard 
            numeroOs={item.numeroOs || `OS-${item.id}`}
            veiculoTitle={item.veiculoDesc || 'Veículo não informado'}
            detalhes={item.clienteNome || 'Cliente não informado'}
            status={item.status}
            valorTotal={item.valorTotal || 0}
            onPress={() => router.push(`/(tabs)/ordens/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>
              {searchQuery ? `Não encontramos resultados para "${searchQuery}"` : 'Nenhuma ordem de serviço encontrada.'}
            </Text>
          ) : null
        }
      />
      
      <FAB icon="add" onPress={() => router.push('/(tabs)/ordens/new')} />
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
  filterArea: {
    marginBottom: SPACING.sm,
  },
  searchArea: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
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
});
