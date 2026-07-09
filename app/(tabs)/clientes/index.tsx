import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { listClientes } from '@/src/services/cliente.service';
import { COLORS } from '@/src/theme';
import type { Cliente } from '@/src/types';

import ScreenHeader from '@/src/components/ScreenHeader';
import SearchBar from '@/src/components/SearchBar';
import Card from '@/src/components/Card';
import EmptyState from '@/src/components/EmptyState';
import FAB from '@/src/components/FAB';

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadData = async () => {
    try {
      const data = await listClientes();
      setClientes(data);
      filterData(data, searchQuery);
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

  const filterData = (data: Cliente[], query: string) => {
    if (!query.trim()) {
      setFilteredClientes(data);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = data.filter(c => 
      c.nome.toLowerCase().includes(lowerQuery) || 
      c.cpf.includes(lowerQuery) ||
      (c.telefone && c.telefone.includes(lowerQuery))
    );
    setFilteredClientes(filtered);
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    filterData(clientes, text);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Clientes" icon="people" />
      
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <SearchBar 
            value={searchQuery} 
            onChangeText={handleSearch} 
            placeholder="Buscar por nome, CPF ou telefone..." 
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
            <Card 
              title={item.nome} 
              subtitle={item.telefone || item.email || 'Sem contato cadastrado'} 
              icon="person-outline"
              onPress={() => router.push(`/(tabs)/clientes/${item.id}`)} 
              style={styles.card}
            />
          )}
          ListEmptyComponent={
            !loading ? (
              <EmptyState 
                icon="people-outline"
                title={searchQuery ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                description={searchQuery ? `Não encontramos resultados para "${searchQuery}"` : 'Comece adicionando seu primeiro cliente.'}
                actionTitle={searchQuery ? undefined : 'Adicionar Cliente'}
                onAction={searchQuery ? undefined : () => router.push('/(tabs)/clientes/new')}
              />
            ) : null
          }
        />
        
        <FAB icon="add" onPress={() => router.push('/(tabs)/clientes/new')} />
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
    paddingBottom: 100, // Espaço para o FAB
    gap: 12,
    flexGrow: 1,
  },
  card: {
    marginBottom: 0,
  },
});
