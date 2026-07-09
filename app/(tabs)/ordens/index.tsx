import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { listOrdensServico } from '@/src/services/ordem-servico.service';
import { listClientes } from '@/src/services/cliente.service';
import { listVeiculos } from '@/src/services/veiculo.service';
import { COLORS } from '@/src/theme';
import type { OrdemServico, Cliente, Veiculo } from '@/src/types';

import ScreenHeader from '@/src/components/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import Card from '@/src/components/Card';
import EmptyState from '@/src/components/EmptyState';
import FAB from '@/src/components/FAB';
import StatusBadge from '@/src/components/StatusBadge';

type OrdemWithDetails = OrdemServico & { 
  clienteNome?: string;
  veiculoDesc?: string;
};

export default function OrdensScreen() {
  const [ordens, setOrdens] = useState<OrdemWithDetails[]>([]);
  const [filteredOrdens, setFilteredOrdens] = useState<OrdemWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
      
      // Ordenar por data (mais recentes primeiro) e status (pendentes primeiro)
      ordensDetalhes.sort((a, b) => {
        if (a.status === 'pendente' && b.status !== 'pendente') return -1;
        if (a.status !== 'pendente' && b.status === 'pendente') return 1;
        return (b.id || 0) - (a.id || 0); // fallback para ID
      });

      setOrdens(ordensDetalhes);
      filterData(ordensDetalhes, searchQuery);
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

  const filterData = (data: OrdemWithDetails[], query: string) => {
    if (!query.trim()) {
      setFilteredOrdens(data);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = data.filter(o => 
      o.id.toString().includes(lowerQuery) || 
      (o.clienteNome && o.clienteNome.toLowerCase().includes(lowerQuery)) ||
      (o.veiculoDesc && o.veiculoDesc.toLowerCase().includes(lowerQuery)) ||
      (o.numeroOs && o.numeroOs.toLowerCase().includes(lowerQuery))
    );
    setFilteredOrdens(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterData(ordens, text);
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Ordens de Serviço" icon="document-text" />
      
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <SearchBar 
            value={searchQuery} 
            onChangeText={handleSearch} 
            placeholder="Buscar por nº, cliente ou veículo..." 
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
            <Card 
              onPress={() => router.push(`/(tabs)/ordens/${item.id}`)} 
              style={styles.card}
            >
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.osNumber}>{item.numeroOs || `OS #${item.id}`}</Text>
                  <Text style={styles.osDate}>
                    {new Date(item.dataAbertura || new Date()).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.clientName}>{item.clienteNome || 'Cliente não encontrado'}</Text>
                <Text style={styles.veiculoDesc}>{item.veiculoDesc || 'Veículo não encontrado'}</Text>
              </View>

              <View style={styles.cardFooter}>
                <Text style={styles.priceLabel}>Valor Total</Text>
                <Text style={styles.priceValue}>{formatCurrency(item.valorTotal)}</Text>
              </View>
            </Card>
          )}
          ListEmptyComponent={
            !loading ? (
              <EmptyState 
                icon="document-text-outline"
                title={searchQuery ? 'Nenhuma ordem encontrada' : 'Nenhuma ordem cadastrada'}
                description={searchQuery ? `Não encontramos resultados para "${searchQuery}"` : 'Comece criando sua primeira ordem de serviço.'}
                actionTitle={searchQuery ? undefined : 'Nova Ordem'}
                onAction={searchQuery ? undefined : () => router.push('/(tabs)/ordens/new')}
              />
            ) : null
          }
        />
        
        <FAB icon="add" onPress={() => router.push('/(tabs)/ordens/new')} />
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
    padding: 0,
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  osNumber: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 2,
  },
  osDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cardBody: {
    padding: 16,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  veiculoDesc: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.gray100,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  priceLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.success || '#00e676',
  },
});
