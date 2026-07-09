import { COLORS, BORDER_RADIUS } from '@/src/theme';
import type { StatusOS } from '@/src/types';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  status: StatusOS;
  style?: any;
};

const STATUS_CONFIG = {
  pendente: { label: 'Pendente', color: '#ffab40', bgColor: '#fff3e0' },
  em_andamento: { label: 'Em Andamento', color: '#40c4ff', bgColor: '#e1f5fe' },
  concluida: { label: 'Concluída', color: '#00e676', bgColor: '#e8f5e9' },
  cancelada: { label: 'Cancelada', color: '#ff5252', bgColor: '#ffebee' },
};

export default function StatusBadge({ status, style }: Props) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pendente;

  return (
    <View style={[styles.badge, { backgroundColor: config.bgColor }, style]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
