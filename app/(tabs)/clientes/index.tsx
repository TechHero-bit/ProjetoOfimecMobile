import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Text } from 'react-native';

import { listClientes } from '@/src/services/cliente.service';
import { listVeiculos } from '@/src/services/veiculo.service';
import { listOrdensServico } from '@/src/services/ordem-servico.service';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import type { Cliente } from '@/src/types';

import AppHeader from '@/src/components/AppHeader';
import SearchBar from '@/src/components/SearchBar';
import FilterChips, { FilterOption } from '@/src/components/FilterChips';
import ClienteCard from '@/src/components/ClienteCard';
import FAB from '@/src/components/FAB';

type ClienteWithDetails = Cliente & {
  veiculosCount: number;
  status: 'ativo' | 'inativo' | 'inadimplente';
  ultimaVisita: string;
};

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'todos', label: 'TODOS' },
  { id: 'ativo', label: 'COM OS ATIVA' },
  { id: 'inativo', label: 'INATIVOS' },
  { id: 'inadimplente', label: 'INADIMPLENTES' },
];

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<ClienteWithDetails[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<ClienteWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [loading, setLoading] = useState(true);
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
        let status: 'ativo' | 'inativo' | 'inadimplente' = 'inativo';
        const temOsAtiva = ordens.some(o => o.status === 'pendente' || o.status === 'em_andamento');
        if (temOsAtiva) {
          status = 'ativo';
        }
        // Simplified inadimplente logic: for now we just don't flag them unless we had payment tracking
        // We'll leave it as ativo/inativo based on OS
        
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
});
