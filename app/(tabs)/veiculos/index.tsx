import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { listVeiculos } from '@/src/services/veiculo.service';
import { listClientes } from '@/src/services/cliente.service';
import { COLORS } from '@/src/theme';
import type { Veiculo, Cliente } from '@/src/types';

import ScreenHeader from '@/src/components/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import Card from '@/src/components/Card';
import EmptyState from '@/src/components/EmptyState';
import FAB from '@/src/components/FAB';

// Tipo estendido para mostrar o nome do cliente na lista
type VeiculoWithCliente = Veiculo & { clienteNome?: string };

export default function VeiculosScreen() {
  const [veiculos, setVeiculos] = useState<VeiculoWithCliente[]>([]);
  const [filteredVeiculos, setFilteredVeiculos] = useState<VeiculoWithCliente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadData = async () => {
    try {
      // Carrega veículos e clientes em paralelo para fazer o "join" no frontend
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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Veículos" icon="car-sport" />
      
      <View style={styles.container}>
        <View style={styles.searchContainer}>
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
            <Card 
              title={`${item.marca} ${item.modelo}`} 
              subtitle={item.clienteNome ? `Cliente: ${item.clienteNome}` : undefined} 
              icon="car-outline"
              rightElement={<View style={styles.placaBadge}><Card title={item.placa} style={styles.placaBadgeInner} /></View>}
              onPress={() => router.push(`/(tabs)/veiculos/${item.id}`)} 
              style={styles.card}
            />
          )}
          ListEmptyComponent={
            !loading ? (
              <EmptyState 
                icon="car-sport-outline"
                title={searchQuery ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
                description={searchQuery ? `Não encontramos resultados para "${searchQuery}"` : 'Comece adicionando seu primeiro veículo.'}
                actionTitle={searchQuery ? undefined : 'Adicionar Veículo'}
                onAction={searchQuery ? undefined : () => router.push('/(tabs)/veiculos/new')}
              />
            ) : null
          }
        />
        
        <FAB icon="add" onPress={() => router.push('/(tabs)/veiculos/new')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1, backgroundColor: COLORS.gray100 },
  searchContainer: {
    padding: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  list: { 
    padding: 16,
    paddingBottom: 100,
    gap: 12,
    flexGrow: 1,
  },
  card: {
    marginBottom: 0,
  },
  placaBadge: {
    marginLeft: 12,
  },
  placaBadgeInner: {
    padding: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.gray100,
  },
});
