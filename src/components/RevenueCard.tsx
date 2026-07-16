import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  label?: string;
  value: string;
  currency?: string;
};

export default function RevenueCard({ label = 'Receita', value, currency = 'R$' }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.currency}>{currency}</Text>
            <Text style={styles.value}>{value}</Text>
          </View>
        </View>
        <View style={styles.iconContainer}>
          <Ionicons name="card" size={32} color={COLORS.onPrimary} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primaryContainer,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.level2,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onPrimaryContainer,
    marginBottom: SPACING.xs,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: SPACING.xs,
  },
  currency: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onPrimaryContainer,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.onPrimaryContainer,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
