import { MaterialCommunityIcons, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // RESPONSIVIDADE: Importando SafeAreaView para evitar cortes

import { useAuth } from '@/src/contexts/AuthContext';
import { listClientes } from '@/src/services/cliente.service';
import { listOrdensServico } from '@/src/services/ordem-servico.service';
import { listVeiculos } from '@/src/services/veiculo.service';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '@/src/theme';
import type { OrdemServico } from '@/src/types';

import AppHeader from '@/src/components/AppHeader';
import BarChart from '@/src/components/BarChart';

// ─── Progress Bar Component ──────────────────────────────────
function ProgressBar({ label, percentage, count, color }: { label: string; percentage: number; count: number; color: string }) {
  return (
    <View style={progressStyles.container}>
      <View style={progressStyles.labelRow}>
        <Text style={progressStyles.label}>{label}</Text>
        <Text style={progressStyles.value}>{percentage}% ({count})</Text>
      </View>
      <View style={progressStyles.track}>
        <View style={[progressStyles.fill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const progressStyles = StyleSheet.create({
  container: { marginBottom: SPACING.md },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.xs },
  label: { ...TYPOGRAPHY.labelCaps, color: COLORS.onSurface },
  value: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurfaceVariant },
  track: { flex: 1, width: '100%', minHeight: 8, maxHeight: 12, backgroundColor: COLORS.surfaceVariant, borderRadius: 999, overflow: 'hidden' }, // RESPONSIVIDADE: Substituindo altura fixa por minHeight e maxHeight
  fill: { height: '100%', borderRadius: 999 },
});

// ─── Status Badge (inline for recent orders) ──────────────────
function OrderStatusTag({ status }: { status: string }) {
  const config = useMemo(() => {
    switch (status) {
      case 'concluida':
        return { label: 'CONCLUÍDA', bg: COLORS.successGreenBg, text: COLORS.successGreen };
      case 'em_andamento':
        return { label: 'EM ANDAMENTO', bg: COLORS.warningYellowBg, text: COLORS.warningYellow };
      case 'inadimplente':
        return { label: 'INADIMPLENTE', bg: '#431407', text: COLORS.statusInadimplente };
      case 'cancelada':
        return { label: 'CANCELADA', bg: `${COLORS.error}20`, text: COLORS.error };
      default:
        return { label: status.toUpperCase(), bg: COLORS.surfaceVariant, text: COLORS.onSurfaceVariant };
    }
  }, [status]);

  return (
    <View style={[tagStyles.badge, { backgroundColor: config.bg }]}>
      <Text style={[tagStyles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const tagStyles = StyleSheet.create({
  badge: { paddingHorizontal: SPACING.xs, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-end' },
  text: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
});

// ─── Main Dashboard ──────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  
  // RESPONSIVIDADE: Pegando a largura da tela para breakpoints dinâmicos e adaptação
  const { width } = useWindowDimensions();
  const isTablet = width >= 600;
  const [stats, setStats] = useState({ clientes: 0, veiculos: 0, ordensAbertas: 0, receita: 0 });
  const [recentes, setRecentes] = useState<OrdemServico[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [allOrdens, setAllOrdens] = useState<OrdemServico[]>([]);

  const load = useCallback(async () => {
    try {
      const [clientes, veiculos, ordens] = await Promise.all([listClientes(), listVeiculos(), listOrdensServico()]);

      const ordensAbertas = ordens.filter((o) => o.status === 'inadimplente' || o.status === 'em_andamento').length;
      const receita = ordens
        .filter((o) => o.status === 'concluida')
        .reduce((sum, o) => sum + (o.valorTotal || 0), 0);

      setStats({
        clientes: clientes.length,
        veiculos: veiculos.length,
        ordensAbertas,
        receita,
      });

      setAllOrdens(ordens);

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
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Compute status percentages
  const orderStats = useMemo(() => {
    const total = allOrdens.length || 1;
    const concluidas = allOrdens.filter(o => o.status === 'concluida').length;
    const andamento = allOrdens.filter(o => o.status === 'em_andamento').length;
    const inadimplentes = allOrdens.filter(o => o.status === 'inadimplente').length;
    const canceladas = allOrdens.filter(o => o.status === 'cancelada').length;
    return {
      concluidas, andamento, inadimplentes, canceladas,
      pctConcluidas: Math.round((concluidas / total) * 100),
      pctAndamento: Math.round((andamento / total) * 100),
      pctInadimplentes: Math.round((inadimplentes / total) * 100),
      pctCanceladas: Math.round((canceladas / total) * 100),
    };
  }, [allOrdens]);

  // User display name
  const userName = useMemo(() => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'Usuário';
  }, [user]);

  const today = new Date();
  const rawDateStr = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const dateStr = rawDateStr.charAt(0).toUpperCase() + rawDateStr.slice(1);

  const chartData = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const days = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
    return days.map((label, index) => {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + index);
      
      const nextDay = new Date(currentDay);
      nextDay.setDate(currentDay.getDate() + 1);

      const value = allOrdens
        .filter(o => {
          if (o.status !== 'concluida') return false;
          const date = new Date(o.dataConclusao || o.dataAtualizacao || o.dataAbertura);
          return date >= currentDay && date < nextDay;
        })
        .reduce((sum, o) => sum + (o.valorTotal || 0), 0);

      return { label, value };
    });
  }, [allOrdens]);

  // Monthly revenue calculation
  const receitaMensal = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return allOrdens
      .filter(o => {
        if (o.status !== 'concluida') return false;
        const date = new Date(o.dataConclusao || o.dataAtualizacao || o.dataAbertura);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + (o.valorTotal || 0), 0);
  }, [allOrdens]);

  const receitaMesPassado = useMemo(() => {
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const yearOfLastMonth = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

    return allOrdens
      .filter(o => {
        if (o.status !== 'concluida') return false;
        const date = new Date(o.dataConclusao || o.dataAtualizacao || o.dataAbertura);
        return date.getMonth() === lastMonth && date.getFullYear() === yearOfLastMonth;
      })
      .reduce((sum, o) => sum + (o.valorTotal || 0), 0);
  }, [allOrdens]);

  const percentualCrescimento = useMemo(() => {
    if (receitaMesPassado === 0) return receitaMensal > 0 ? 100 : 0;
    return Math.round(((receitaMensal - receitaMesPassado) / receitaMesPassado) * 100);
  }, [receitaMensal, receitaMesPassado]);

  const recebido = receitaMensal; // Mesma lógica da Receita Mensal

  const aReceber = useMemo(() => {
    return allOrdens
      .filter(o => o.status === 'inadimplente' || o.status === 'em_andamento')
      .reduce((sum, o) => sum + (o.valorTotal || 0), 0);
  }, [allOrdens]);

  const receitaSemanal = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const distanceToMonday = (dayOfWeek + 6) % 7; // Segunda é 0, Domingo é 6
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return allOrdens
      .filter(o => {
        if (o.status !== 'concluida') return false;
        const date = new Date(o.dataConclusao || o.dataAtualizacao || o.dataAbertura);
        return date >= monday && date <= sunday;
      })
      .reduce((sum, o) => sum + (o.valorTotal || 0), 0);
  }, [allOrdens]);

  return (
    // RESPONSIVIDADE: Envolvendo a raiz em SafeAreaView
    <SafeAreaView style={styles.root}>
      <AppHeader />

      {/* RESPONSIVIDADE: Aplicando flexGrow: 1 para o ScrollView preencher o espaço restante */}
      <ScrollView
        contentContainerStyle={[styles.container, { flexGrow: 1, paddingHorizontal: isTablet ? SPACING.lg * 2 : SPACING.margin }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Saudação ── */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingTitle}>Olá, {userName}</Text>
          <View style={styles.subtitleRow}>
            <Text style={styles.greetingSubtitle}>Resumo da oficina de hoje.</Text>
            <View style={styles.datePill}>
              <Ionicons name="calendar-outline" size={14} color="#BE2528" />
              <Text style={styles.datePillText}>{dateStr}</Text>
            </View>
          </View>
        </View>


        {/* ── Cards de Resumo (Bento Grid) ── */}
        <View style={styles.bentoGrid}>
          {/* Clientes Ativos */}
          {/* RESPONSIVIDADE: Ajuste dinâmico de estilo caso seja tablet (colocando os 3 na mesma linha) */}
          <Pressable style={[styles.bentoCardHalf, isTablet && styles.bentoCardTablet]} onPress={() => router.replace('/(tabs)/clientes')}>
            <View style={[styles.bentoIndicator, { backgroundColor: COLORS.tertiary }]} />
            <View style={styles.bentoContent}>
              <MaterialIcons name="person" size={isTablet ? 32 : 24} color={COLORS.tertiary} />
              <Text style={styles.bentoValue}>{stats.clientes}</Text>
              <Text style={styles.bentoLabel}>CLIENTES ATIVOS</Text>
            </View>
          </Pressable>

          {/* Veículos no Pátio */}
          <Pressable style={[styles.bentoCardHalf, isTablet && styles.bentoCardTablet]} onPress={() => router.replace('/(tabs)/veiculos')}>
            <View style={[styles.bentoIndicator, { backgroundColor: COLORS.secondaryFixedDim }]} />
            <View style={styles.bentoContent}>
              <MaterialIcons name="directions-car" size={isTablet ? 32 : 24} color={COLORS.secondaryFixedDim} />
              <Text style={styles.bentoValue}>{stats.veiculos}</Text>
              <Text style={styles.bentoLabel}>VEÍCULOS PÁTIO</Text>
            </View>
          </Pressable>

          {/* Ordens Abertas (full width) */}
          <Pressable style={[styles.bentoCardFull, isTablet && styles.bentoCardTablet]} onPress={() => router.replace('/(tabs)/ordens')}>
            <View style={[styles.bentoIndicator, { backgroundColor: COLORS.primaryContainer }]} />
            <View style={styles.bentoContent}>
              <MaterialIcons name="assignment" size={isTablet ? 32 : 24} color={COLORS.primaryContainer} />
              <Text style={styles.bentoValue}>{stats.ordensAbertas}</Text>
              <Text style={styles.bentoLabel}>ORDENS ABERTAS</Text>
            </View>
          </Pressable>
        </View>

        {/* ── Status das Ordens ── */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Status das Ordens</Text>
          <ProgressBar
            label="CONCLUÍDAS"
            percentage={orderStats.pctConcluidas}
            count={orderStats.concluidas}
            color={COLORS.tertiary}
          />
          <ProgressBar
            label="EM ANDAMENTO"
            percentage={orderStats.pctAndamento}
            count={orderStats.andamento}
            color={COLORS.primaryContainer}
          />
          <ProgressBar
            label="INADIMPLENTES"
            percentage={orderStats.pctInadimplentes}
            count={orderStats.inadimplentes}
            color={COLORS.statusInadimplente}
          />
          <ProgressBar
            label="CANCELADAS"
            percentage={orderStats.pctCanceladas}
            count={orderStats.canceladas}
            color={COLORS.error}
          />
        </View>

        {/* ── Receita Mensal (card estilo web) ── */}
        <View style={styles.financeCard}>
          <View style={styles.financeHeader}>
            <View>
              <Text style={styles.financeLabel}>RECEITA MENSAL</Text>
              <Text style={styles.financeValue}>{formatCurrency(receitaMensal || 0)}</Text>
            </View>
            <View style={[styles.financeBadge, { backgroundColor: percentualCrescimento >= 0 ? COLORS.surfaceVariant : `${COLORS.error}20` }]}>
              <MaterialIcons name={percentualCrescimento >= 0 ? "trending-up" : "trending-down"} size={16} color={percentualCrescimento >= 0 ? COLORS.tertiary : COLORS.error} />
              <Text style={[styles.financeBadgeText, { color: percentualCrescimento >= 0 ? COLORS.tertiary : COLORS.error }]}>
                {percentualCrescimento >= 0 ? '+' : ''}{percentualCrescimento}%
              </Text>
            </View>
          </View>
          <View style={styles.financeDivider} />
          <View style={styles.financeGrid}>
            <View style={styles.financeGridItem}>
              <Text style={styles.financeGridLabel}>RECEBIDO</Text>
              <Text style={styles.financeGridValue}>{formatCurrency(recebido || 0)}</Text>
            </View>
            <View style={styles.financeGridItem}>
              <Text style={styles.financeGridLabel}>A RECEBER</Text>
              <Text style={styles.financeGridValue}>{formatCurrency(aReceber || 0)}</Text>
            </View>
          </View>
        </View>

        {/* ── Receita Semanal (chart existente) ── */}
        <View style={styles.weeklyCard}>
          <Text style={styles.weeklyLabel}>RECEITA SEMANAL</Text>
          <Text style={styles.weeklyValue}>{formatCurrency(receitaSemanal || 0)}</Text>
          <View style={styles.chartWrapper}>
            {/* RESPONSIVIDADE: Gráfico escalável para preencher mais altura em tablets */}
            <BarChart data={chartData} height={isTablet ? 150 : 100} />
          </View>
        </View>

        {/* ── Ordens Recentes ── */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Ordens Recentes</Text>
          <Pressable onPress={() => router.replace('/(tabs)/ordens')}>
            <Text style={styles.seeAllText}>VER TODAS</Text>
          </Pressable>
        </View>

        <View style={styles.recentList}>
          {recentes.length > 0 ? (
            recentes.map((os) => (
              <Pressable
                key={os.id}
                style={({ pressed }) => [styles.recentCard, pressed && styles.recentCardPressed]}
                onPress={() => router.push(`/(tabs)/ordens/${os.id}`)}
              >
                <View style={styles.recentLeft}>
                  <View style={[
                    styles.recentIcon,
                    { borderColor: os.status === 'concluida' ? COLORS.primaryContainer : COLORS.tertiary }
                  ]}>
                    <MaterialCommunityIcons
                      name={os.status === 'concluida' ? 'wrench' : 'cog'}
                      size={22}
                      color={os.status === 'concluida' ? COLORS.primaryContainer : COLORS.tertiary}
                    />
                  </View>
                  <View>
                    <Text style={styles.recentTitle}>{os.numeroOs || `OS-${os.id}`}</Text>
                    <Text style={styles.recentSubtitle}>{os.veiculoInfo || 'Veículo não informado'}</Text>
                  </View>
                </View>
                <View style={styles.recentRight}>
                  <OrderStatusTag status={os.status} />
                  <Text style={styles.recentTime}>
                    {new Date(os.dataAtualizacao || os.dataAbertura).toLocaleDateString('pt-BR', {
                      day: '2-digit', month: '2-digit',
                    })}{' '}
                    {new Date(os.dataAtualizacao || os.dataAbertura).toLocaleTimeString('pt-BR', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                </View>
              </Pressable>
            ))
          ) : (
            <Text style={styles.emptyText}>Nenhuma ordem recente.</Text>
          )}
        </View>

        <View style={styles.quickActions}>
          <Pressable
            style={({ pressed }) => [styles.quickActionButton, pressed && styles.quickActionPressed]}
            onPress={() => router.push('/(tabs)/clientes/new')}
          >
            <MaterialIcons name="person-add" size={22} color={COLORS.onPrimaryContainer} />
            <Text style={styles.quickActionText}>Adicionar cliente</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.quickActionButton, pressed && styles.quickActionPressed]}
            onPress={() => router.push('/(tabs)/veiculos/new')}
          >
            <MaterialIcons name="add-road" size={22} color={COLORS.onPrimaryContainer} />
            <Text style={styles.quickActionText}>Adicionar carro</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.quickActionButton, pressed && styles.quickActionPressed]}
            onPress={() => router.push('/(tabs)/ordens/new')}
          >
            <MaterialIcons name="post-add" size={22} color={COLORS.onPrimaryContainer} />
            <Text style={styles.quickActionText}>Adicionar OS</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.margin,
    gap: SPACING.lg,
    paddingBottom: 120,
  },

  // Greeting
  greetingSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  greetingTitle: {
    ...TYPOGRAPHY.displayLg,
    color: COLORS.onSurface,
  },
  greetingSubtitle: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurfaceVariant,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1f24',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: '#33353a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  datePillText: {
    fontSize: 12,
    color: '#e3beba',
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  quickActionButton: {
    flex: 1,
    minWidth: 104,
    minHeight: 72,
    backgroundColor: COLORS.primaryContainer,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    ...SHADOWS.level1,
  },
  quickActionPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  quickActionText: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onPrimaryContainer,
    textAlign: 'center',
  },

  // Bento Grid
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  bentoCardHalf: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.level1,
  },
  bentoCardFull: {
    width: '100%',
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    overflow: 'hidden',
    position: 'relative',
    ...SHADOWS.level1,
  },
  // RESPONSIVIDADE: Classe para adaptar largura dinamicamente no Grid
  bentoCardTablet: {
    flex: 1,
    minWidth: '30%', // Permite 3 colunas em tablets
    width: 'auto',
  },
  bentoIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  bentoContent: {
    padding: SPACING.md,
    paddingLeft: SPACING.md + 4,
    gap: SPACING.xs,
  },
  bentoValue: {
    ...TYPOGRAPHY.statLg,
    color: COLORS.onSurface,
    marginTop: SPACING.sm,
  },
  bentoLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
  },

  // Status Section
  statusSection: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
  sectionTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },

  // Finance Card (Monthly)
  financeCard: {
    backgroundColor: COLORS.inputBg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    ...SHADOWS.level1,
  },
  financeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  financeLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
  },
  financeValue: {
    ...TYPOGRAPHY.statLg,
    color: COLORS.onSurface,
    marginTop: SPACING.xs,
  },
  financeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    gap: SPACING.xs,
  },
  financeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.tertiary,
    letterSpacing: 0.5,
  },
  financeDivider: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
  },
  financeGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  financeGridItem: {
    flex: 1,
  },
  financeGridLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  financeGridValue: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
    marginTop: 2,
  },

  // Weekly Card (existing chart)
  weeklyCard: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    ...SHADOWS.level1,
  },
  weeklyLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
  },
  weeklyValue: {
    ...TYPOGRAPHY.displayLg,
    color: COLORS.primary,
  },
  chartWrapper: {
    marginTop: SPACING.md,
  },

  // Recent Orders
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.primary,
  },
  recentList: {
    gap: SPACING.sm,
  },
  recentCard: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 64,
  },
  recentCardPressed: {
    borderColor: COLORS.primaryContainer,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  recentIcon: {
    width: 40,
    aspectRatio: 1, // RESPONSIVIDADE: Substituindo height fixa por aspectRatio para manter a proporção
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentTitle: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  recentSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: 1,
  },
  recentRight: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  recentTime: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
});
