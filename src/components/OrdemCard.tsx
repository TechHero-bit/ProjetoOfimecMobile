import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import type { StatusOS } from '@/src/types';
import { useState, useEffect } from 'react';

type Props = {
  numeroOs: string;
  veiculoTitle: string;
  detalhes: string; // ex: "Placa: ABC-1234 • Carlos Silva"
  status: StatusOS;
  valorTotal: number;
  onPress?: () => void;
  style?: any;
};

export default function OrdemCard({ 
  numeroOs, 
  veiculoTitle, 
  detalhes, 
  status, 
  valorTotal, 
  onPress,
  style 
}: Props) {
  const [currentStatus, setCurrentStatus] = useState<StatusOS>(status);

  useEffect(() => {
    setCurrentStatus(status);
  }, [status]);

  const cycleStatus = () => {
    const cycleMap: Record<string, StatusOS> = {
      pendente: 'em_andamento',
      em_andamento: 'concluida',
      concluida: 'pendente',
      cancelada: 'cancelada'
    };
    setCurrentStatus(cycleMap[currentStatus] || 'pendente');
  };

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const getStatusConfig = () => {
    switch(currentStatus) {
      case 'pendente':
        return { 
          color: COLORS.onSurfaceVariant, 
          label: 'PENDENTE', 
          bg: COLORS.surfaceVariant 
        };
      case 'em_andamento':
        return { 
          color: '#f59e0b', 
          label: 'EM ANDAMENTO', 
          bg: '#451a03' 
        };
      case 'concluida':
        return { 
          color: '#10b981', 
          label: 'PRONTO', 
          bg: '#064e3b' 
        };
      case 'cancelada':
        return { 
          color: COLORS.statusCancelada, 
          label: 'CANCELADA', 
          bg: '#450A0A' 
        };
      default:
        return { 
          color: '#ef4444', 
          label: 'PENDENTE', 
          bg: '#7f1d1d' 
        };
    }
  };

  const statusConfig = getStatusConfig();
  const Container: any = onPress ? Pressable : View;

  return (
    <Container
      style={({ pressed }: any) => [
        styles.container,
        { borderLeftColor: statusConfig.color },
        pressed && onPress && styles.pressed,
        style
      ]}
      onPress={onPress}
    >
      <View style={styles.topSection}>
        <View style={styles.header}>
          <View style={styles.statusRow}>
            <Text style={styles.numero}>{numeroOs}</Text>
            <TouchableOpacity 
              style={[styles.chip, { backgroundColor: statusConfig.bg }]}
              onPress={cycleStatus}
            >
              <Text style={[styles.chipText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </TouchableOpacity>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.onSurfaceVariant} />
        </View>
        
        <Text style={styles.title}>{veiculoTitle}</Text>
        <Text style={styles.subtitle}>{detalhes}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.bottomSection}>
        <View style={styles.valorContainer}>
          <Ionicons name="cash-outline" size={16} color={COLORS.onSurfaceVariant} />
          <Text style={styles.valorLabel}>VALOR TOTAL</Text>
        </View>
        <Text style={styles.valor}>{formatCurrency(valorTotal)}</Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    borderLeftWidth: 4,
    padding: SPACING.md,
    ...SHADOWS.level1,
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderColor: COLORS.primary,
  },
  topSection: {
    marginBottom: SPACING.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  numero: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  chipText: {
    ...TYPOGRAPHY.labelCaps,
  },
  title: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.surfaceVariant,
    marginVertical: SPACING.xs,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  valorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  valorLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
  },
  valor: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.primary,
  },
});
