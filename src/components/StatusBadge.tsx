import { BORDER_RADIUS, COLORS, SPACING } from '@/src/theme';
import type { StatusOS } from '@/src/types';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  status: StatusOS;
  style?: any;
};

const STATUS_CONFIG = {
  pendente: { 
    label: 'Pendente', 
    color: COLORS.statusPendente, 
    bgColor: '#4A3600', // Dark amber
    textColor: COLORS.statusPendente
  },
  em_andamento: { 
    label: 'Em Andamento', 
    color: COLORS.statusEmAndamento, 
    bgColor: '#1E3A8A', // Dark blue
    textColor: COLORS.statusEmAndamento
  },
  concluida: { 
    label: 'Concluída', 
    color: COLORS.statusConcluida, 
    bgColor: '#064E3B', // Dark green
    textColor: COLORS.statusConcluida
  },
  cancelada: { 
    label: 'Cancelada', 
    color: COLORS.statusCancelada, 
    bgColor: '#7F1D1D', // Dark red
    textColor: COLORS.statusCancelada
  },
};

export default function StatusBadge({ status, style }: Props) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pendente;

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }, style]}>
      <View style={[styles.dot, { backgroundColor: config.textColor }]} />
      <Text style={[styles.text, { color: config.textColor }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
    gap: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
