import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  placa: string;
  modelo: string;
  ano: number | string;
  proprietario?: string;
  isEmpresa?: boolean;
  onPress?: () => void;
  style?: any;
};

export default function VeiculoCard({ 
  placa, 
  modelo, 
  ano, 
  proprietario, 
  isEmpresa = false,
  onPress,
  style 
}: Props) {
  const Container: any = onPress ? Pressable : View;

  return (
    <Container
      style={({ pressed }: any) => [
        styles.container,
        pressed && onPress && styles.pressed,
        style
      ]}
      onPress={onPress}
    >
      <View style={styles.borderIndicator} />
      
      <View style={styles.headerRow}>
        <View style={styles.placaSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="car" size={24} color={COLORS.onSurfaceVariant} />
          </View>
          <View>
            <Text style={styles.label}>PLACA</Text>
            <Text style={styles.placa}>{placa}</Text>
          </View>
        </View>
        
        <Pressable style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={COLORS.onSurfaceVariant} />
        </Pressable>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailCol}>
          <Text style={styles.label}>MODELO</Text>
          <Text style={styles.value} numberOfLines={1}>{modelo}</Text>
        </View>
        <View style={styles.detailCol}>
          <Text style={styles.label}>ANO</Text>
          <Text style={styles.value}>{ano}</Text>
        </View>
        
        {proprietario && (
          <View style={styles.proprietarioRow}>
            <Text style={styles.label}>PROPRIETÁRIO</Text>
            <View style={styles.proprietarioContainer}>
              <Ionicons 
                name={isEmpresa ? "business" : "person"} 
                size={14} 
                color={COLORS.onSurfaceVariant} 
              />
              <Text style={styles.value} numberOfLines={1}>{proprietario}</Text>
            </View>
          </View>
        )}
      </View>
      
      <Ionicons name="chevron-forward" size={20} color={COLORS.primaryContainer} style={styles.chevron} />
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    position: 'relative',
    overflow: 'hidden',
    ...SHADOWS.level1,
  },
  pressed: {
    opacity: 0.8,
    borderColor: COLORS.primaryContainer,
  },
  borderIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: COLORS.primaryContainer,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingLeft: SPACING.xs,
  },
  placaSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
    marginBottom: 2,
  },
  placa: {
    ...TYPOGRAPHY.statLg,
    color: COLORS.onSurface,
    letterSpacing: 2,
  },
  moreButton: {
    padding: SPACING.xs,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingLeft: SPACING.xs,
    gap: SPACING.md,
  },
  detailCol: {
    minWidth: '40%',
  },
  value: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
  },
  proprietarioRow: {
    width: '100%',
    marginTop: SPACING.xs,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceVariant,
  },
  proprietarioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  chevron: {
    position: 'absolute',
    right: SPACING.md,
    bottom: SPACING.md,
    opacity: 0, // In CSS this is group-hover:opacity-100, we'll just keep it hidden or let the user click the whole card
  },
});
