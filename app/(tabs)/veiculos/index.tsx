import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Text } from 'react-native';

import { listVeiculos } from '@/src/services/veiculo.service';
import { listClientes } from '@/src/services/cliente.service';
import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import type { Veiculo } from '@/src/types';

import AppHeader from '@/src/components/AppHeader';
import SearchBar from '@/src/components/SearchBar';
import VeiculoCard from '@/src/components/VeiculoCard';
import FAB from '@/src/components/FAB';

type VeiculoWithCliente = Veiculo & { clienteNome?: string };

export default function VeiculosScreen() {
  const [veiculos, setVeiculos] = useState<VeiculoWithCliente[]>([]);
  const [filteredVeiculos, setFilteredVeiculos] = useState<VeiculoWithCliente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadData = async () => {
    try {
      const [veiculosData, clientesData] = await Promise.all([
        listVeiculos(),
        listClientes()
      ]);
      
      const clientesMap = new Map<number, string>();
      clientesData.forEach(c => clientesMap.set(c.id, c.nome));
      
      const veiculosComCliente = veiculosData.map(v => ({
        ...v,
        clienteNome: v.clienteId ? clientesMap.get(v.clienteId) : undefined
      }));
      
      setVeiculos(veiculosComCliente);
      filterData(veiculosComCliente, searchQuery);
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

  const filterData = (data: VeiculoWithCliente[], query: string) => {
    if (!query.trim()) {
      setFilteredVeiculos(data);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = data.filter(v => 
      v.placa.toLowerCase().includes(lowerQuery) || 
      v.marca.toLowerCase().includes(lowerQuery) ||
      v.modelo.toLowerCase().includes(lowerQuery) ||
      (v.clienteNome && v.clienteNome.toLowerCase().includes(lowerQuery))
    );
    setFilteredVeiculos(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterData(veiculos, text);
  };

  return (
    <View style={styles.root}>
      <AppHeader />
      
      <View style={styles.headerArea}>
        <Text style={styles.title}>Veículos</Text>
        <Text style={styles.subtitle}>Gestão da frota e veículos de clientes.</Text>
      </View>

      <View style={styles.searchArea}>
        <SearchBar 
          value={searchQuery} 
          onChangeText={handleSearch} 
          placeholder="Buscar por placa, marca ou cliente..." 
        />
      </View>

      <FlatList
        data={filteredVeiculos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <VeiculoCard 
            placa={item.placa}
            modelo={`${item.marca} ${item.modelo}`}
            ano={item.ano}
            proprietario={item.clienteNome || 'Desconhecido'}
            // isEmpresa could be inferred if nome includes 'Ltda', 'SA', etc, 
            // but just passing false for now as it's optional
            isEmpresa={item.clienteNome ? item.clienteNome.toLowerCase().includes('ltda') : false}
            onPress={() => router.push(`/(tabs)/veiculos/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>
              {searchQuery ? `Não encontramos resultados para "${searchQuery}"` : 'Nenhum veículo cadastrado.'}
            </Text>
          ) : null
        }
      />
      
      <FAB icon="add" onPress={() => router.push('/(tabs)/veiculos/new')} />
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
