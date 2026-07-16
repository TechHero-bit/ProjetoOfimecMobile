import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/src/contexts/AuthContext';
import { listClientes } from '@/src/services/cliente.service';
import { listOrdensServico } from '@/src/services/ordem-servico.service';
import { listVeiculos } from '@/src/services/veiculo.service';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '@/src/theme';
import type { OrdemServico } from '@/src/types';

import AppHeader from '@/src/components/AppHeader';
import Button from '@/src/components/Button';
import OrdemCard from '@/src/components/OrdemCard';
import BarChart from '@/src/components/BarChart';

export default function Dashboard() {
  const { session } = useAuth();
  const [stats, setStats] = useState({ clientes: 0, veiculos: 0, ordensAtivas: 0, receita: 0 });
  const [recentes, setRecentes] = useState<OrdemServico[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [clientes, veiculos, ordens] = await Promise.all([listClientes(), listVeiculos(), listOrdensServico()]);
      
      const ordensAtivas = ordens.filter((o) => o.status === 'pendente' || o.status === 'em_andamento').length;
      const receita = ordens
        .filter((o) => o.status === 'concluida')
        .reduce((sum, o) => sum + (o.valorPago || 0), 0);

      setStats({ 
        clientes: clientes.length, 
        veiculos: veiculos.length, 
        ordensAtivas,
        receita
      });

      // Últimas 3 OS
      const sorted = [...ordens].sort((a, b) => {
        return new Date(b.dataAtualizacao || b.dataAbertura).getTime() - new Date(a.dataAtualizacao || a.dataAbertura).getTime();
      });
      setRecentes(sorted.slice(0, 3));
    } catch (err) {
      console.error(err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

  const mockChartData = [
    { label: 'S', value: 1200 },
    { label: 'T', value: 800 },
    { label: 'Q', value: 3000 },
    { label: 'Q', value: 2500 },
    { label: 'S', value: 4500 },
    { label: 'S', value: 450 }, // today
  ];

  return (
    <View style={styles.root}>
      <AppHeader />
      
      <ScrollView 
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Visão Geral Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Visão Geral</Text>
        </View>

        <View style={styles.dateRow}>
          <Text style={styles.dateText}>Resumo do dia • {dateStr.replace('. de', '')}</Text>
        </View>

        {/* KPIs */}
        <View style={styles.kpiRow}>
          <View style={[styles.kpiCard, { borderColor: COLORS.primaryContainer }]}>
            <View style={styles.kpiIconRow}>
              <Ionicons name="document-text" size={24} color={COLORS.primaryContainer} />
              <Ionicons name="chevron-forward" size={16} color={COLORS.onSurfaceVariant} />
            </View>
            <Text style={styles.kpiValue}>{stats.ordensAtivas}</Text>
            <Text style={styles.kpiLabel}>Ordens Ativas</Text>
          </View>
          
          <View style={[styles.kpiCard, { borderColor: COLORS.tertiaryContainer }]}>
            <View style={styles.kpiIconRow}>
              <Ionicons name="people" size={24} color={COLORS.tertiaryContainer} />
              <Ionicons name="chevron-forward" size={16} color={COLORS.onSurfaceVariant} />
            </View>
            <Text style={styles.kpiValue}>{stats.clientes}</Text>
            <Text style={styles.kpiLabel}>Clientes Totais</Text>
          </View>
        </View>

        {/* Receita Semanal */}
        <View style={styles.receitaCard}>
          <Text style={styles.receitaLabel}>Receita Semanal</Text>
          <Text style={styles.receitaValue}>{formatCurrency(stats.receita || 12450.00)}</Text>
          <View style={styles.chartWrapper}>
            <BarChart data={mockChartData} height={100} />
          </View>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.actionsGrid}>
          <Button 
            title="Nova Ordem" 
            icon="add-circle-outline" 
            onPress={() => router.push('/(tabs)/ordens/new')}
            style={[styles.actionBtn, styles.actionPrimary]}
          />
          <Button 
            title="Novo Cliente" 
            icon="person-add-outline" 
            onPress={() => router.push('/(tabs)/clientes/new')}
            style={[styles.actionBtn, styles.actionSecondary]}
            variant="outline"
          />
        </View>
        <Button 
          title="Novo Veículo" 
          icon="car-sport-outline" 
          onPress={() => router.push('/(tabs)/veiculos/new')}
          style={styles.actionFullBtn}
          variant="outline"
        />

        {/* Últimas Atualizações */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimas Atualizações</Text>
        </View>

        <View style={styles.recentesList}>
          {recentes.length > 0 ? (
            recentes.map((os) => (
              <OrdemCard 
                key={os.id}
                numeroOs={os.numeroOs || `OS-${os.id}`}
                veiculoTitle={os.veiculoInfo || 'Veículo não informado'}
                detalhes={os.clienteNome || 'Cliente não informado'}
                status={os.status}
                valorTotal={os.valorTotal || 0}
                onPress={() => router.push(`/(tabs)/ordens/${os.id}`)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma ordem recente.</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: { 
    padding: SPACING.md, 
    gap: SPACING.md,
    paddingBottom: 120 
  },
  sectionHeader: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
  },
  dateRow: {
    marginBottom: SPACING.xs,
  },
  dateText: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    ...SHADOWS.level1,
  },
  kpiIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  kpiValue: {
    ...TYPOGRAPHY.displayLg,
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  kpiLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
  },
  receitaCard: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    ...SHADOWS.level1,
    marginTop: SPACING.xs,
  },
  receitaLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
  },
  receitaValue: {
    ...TYPOGRAPHY.displayLg,
    color: COLORS.primary,
  },
  chartWrapper: {
    marginTop: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  actionBtn: {
    flex: 1,
  },
  actionPrimary: {
    backgroundColor: COLORS.primaryContainer,
  },
  actionSecondary: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderColor: COLORS.surfaceVariant,
  },
  actionFullBtn: {
    width: '100%',
    backgroundColor: COLORS.surfaceContainerHigh,
    borderColor: COLORS.surfaceVariant,
  },
  recentesList: {
    gap: SPACING.md,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
