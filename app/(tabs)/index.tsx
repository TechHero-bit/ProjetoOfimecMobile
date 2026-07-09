import { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { listClientes } from '@/src/services/cliente.service';
import { listOrdensServico } from '@/src/services/ordem-servico.service';
import { listVeiculos } from '@/src/services/veiculo.service';
import { useAuth } from '@/src/contexts/AuthContext';
import { COLORS } from '@/src/theme';
import type { OrdemServico } from '@/src/types';

import ScreenHeader from '@/src/components/ScreenHeader';
import StatCard from '@/src/components/StatCard';
import StatusBadge from '@/src/components/StatusBadge';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';

export default function Dashboard() {
  const { session } = useAuth();
  const [stats, setStats] = useState({ clientes: 0, veiculos: 0, ordens: 0, pendentes: 0, emAndamento: 0, concluidas: 0, receita: 0 });
  const [recentes, setRecentes] = useState<OrdemServico[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [clientes, veiculos, ordens] = await Promise.all([listClientes(), listVeiculos(), listOrdensServico()]);
      
      const pendentes = ordens.filter((o) => o.status === 'pendente').length;
      const emAndamento = ordens.filter((o) => o.status === 'em_andamento').length;
      const concluidas = ordens.filter((o) => o.status === 'concluida').length;
      const receita = ordens
        .filter((o) => o.status === 'concluida')
        .reduce((sum, o) => sum + (o.valorPago || 0), 0);

      setStats({ 
        clientes: clientes.length, 
        veiculos: veiculos.length, 
        ordens: ordens.length, 
        pendentes,
        emAndamento,
        concluidas,
        receita
      });

      // Últimas 5 OS
      setRecentes(ordens.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const userName = session?.user?.email?.split('@')[0] || 'Usuário';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader 
        title={`${getGreeting()}, ${userName}!`}
        subtitle={new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        icon="briefcase"
      />
      
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <View style={styles.statsGrid}>
          <StatCard 
            title="Clientes" 
            value={stats.clientes} 
            icon="people" 
            iconColors={['#6c63ff', '#6c63ff15']} 
            onPress={() => router.push('/(tabs)/clientes')}
          />
          <StatCard 
            title="Veículos" 
            value={stats.veiculos} 
            icon="car-sport" 
            iconColors={['#00d2ff', '#00d2ff15']} 
            onPress={() => router.push('/(tabs)/veiculos')}
          />
          <StatCard 
            title="Ordens" 
            value={stats.ordens} 
            icon="document-text" 
            iconColors={['#ffab40', '#ffab4015']} 
            onPress={() => router.push('/(tabs)/ordens')}
          />
          <StatCard 
            title="Receita" 
            value={`R$ ${stats.receita.toFixed(2)}`} 
            icon="cash" 
            iconColors={['#00e676', '#00e67615']} 
          />
        </View>

        <Card title="Status das Ordens" style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Pendentes</Text>
              <Text style={[styles.statusValue, { color: '#ffab40' }]}>{stats.pendentes}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Andamento</Text>
              <Text style={[styles.statusValue, { color: '#40c4ff' }]}>{stats.emAndamento}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Concluídas</Text>
              <Text style={[styles.statusValue, { color: '#00e676' }]}>{stats.concluidas}</Text>
            </View>
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Ordens Recentes</Text>
          <Button 
            title="Ver Todas" 
            variant="outline" 
            onPress={() => router.push('/(tabs)/ordens')} 
            style={styles.seeAllBtn}
          />
        </View>

        {recentes.length > 0 ? (
          <View style={styles.recentesList}>
            {recentes.map((os) => (
              <Card 
                key={os.id} 
                style={styles.osCard}
                onPress={() => router.push(`/(tabs)/ordens/${os.id}`)}
              >
                <View style={styles.osCardHeader}>
                  <Text style={styles.osNumero}>{os.numeroOs || `OS #${os.id}`}</Text>
                  <StatusBadge status={os.status} />
                </View>
                <Text style={styles.osCliente}>{os.clienteNome}</Text>
                <Text style={styles.osVeiculo}>{os.veiculoInfo}</Text>
              </Card>
            ))}
          </View>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nenhuma ordem recente.</Text>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { padding: 20, backgroundColor: COLORS.gray100, gap: 20, paddingBottom: 100 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusCard: {
    marginTop: 4,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
  },
  statusItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
  },
  statusLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: -8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  seeAllBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  recentesList: {
    gap: 12,
  },
  osCard: {
    padding: 0, // override
  },
  osCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  osNumero: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  osCliente: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  osVeiculo: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    color: COLORS.textSecondary,
  },
});
