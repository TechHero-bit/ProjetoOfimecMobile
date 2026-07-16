import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  nome: string;
  telefone?: string;
  veiculosCount?: number;
  ultimaVisita?: string;
  status?: 'ativo' | 'inativo' | 'inadimplente';
  onPress?: () => void;
  style?: any;
};

export default function ClienteCard({ 
  nome, 
  telefone, 
  veiculosCount = 0, 
  ultimaVisita = 'N/A', 
  status = 'ativo', 
  onPress,
  style 
}: Props) {
  
  // Get Monogram (up to 2 letters)
  const monogram = nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  const getStatusConfig = () => {
    switch(status) {
      case 'inadimplente':
        return { color: COLORS.error, label: 'Inadimplente', icon: 'warning' };
      case 'inativo':
        return { color: COLORS.onSurfaceVariant, label: 'Inativo', dot: true };
      default:
        return { color: COLORS.primary, label: 'OS Ativa', dot: true };
    }
  };

  const statusConfig = getStatusConfig();
  
  const getMonogramStyle = () => {
    if (status === 'inadimplente') {
      return { bg: '#302022', border: `${COLORS.error}4D`, text: COLORS.error };
    }
    if (status === 'inativo') {
      return { bg: '#2C2C2E', border: '#3A3A3C', text: COLORS.secondary };
    }
    return { bg: COLORS.surfaceContainerHighest, border: COLORS.outlineVariant, text: COLORS.primary };
  };

  const monoStyle = getMonogramStyle();
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
      <View style={[styles.borderIndicator, { backgroundColor: statusConfig.color }]} />
      
      <View style={styles.topSection}>
        <View style={styles.headerLeft}>
          <View style={[
            styles.monogramContainer, 
            { backgroundColor: monoStyle.bg, borderColor: monoStyle.border }
          ]}>
            <Text style={[styles.monogramText, { color: monoStyle.text }]}>{monogram}</Text>
          </View>
          <View>
            <Text style={styles.nome} numberOfLines={1}>{nome}</Text>
            {telefone && (
              <View style={styles.phoneContainer}>
                <Ionicons name="phone-portrait-outline" size={14} color={COLORS.onSurfaceVariant} />
                <Text style={styles.telefone}>{telefone}</Text>
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.veiculosBadge}>
          <Text style={styles.veiculosText}>{veiculosCount} VEÍCULO{veiculosCount !== 1 ? 'S' : ''}</Text>
        </View>
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>ÚLTIMA VISITA</Text>
            <Text style={styles.infoValue}>{ultimaVisita}</Text>
          </View>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>STATUS</Text>
            <View style={styles.statusContainer}>
              {statusConfig.dot && <View style={[styles.statusDot, { backgroundColor: statusConfig.color }]} />}
              {statusConfig.icon && <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} style={{marginRight: 4}} />}
              <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.onSurfaceVariant} />
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
    overflow: 'hidden',
    padding: SPACING.md,
    ...SHADOWS.level1,
  },
  pressed: {
    opacity: 0.8,
    borderColor: COLORS.outline,
  },
  borderIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
    paddingLeft: SPACING.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  monogramContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  monogramText: {
    ...TYPOGRAPHY.headlineSm,
  },
  nome: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  telefone: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  veiculosBadge: {
    backgroundColor: COLORS.surfaceContainerHighest,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    marginLeft: SPACING.sm,
  },
  veiculosText: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
    paddingTop: SPACING.md,
    paddingLeft: SPACING.xs,
  },
  infoRow: {
    flexDirection: 'row',
    gap: SPACING.xl,
  },
  infoCol: {
    gap: 4,
  },
  infoLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.tertiaryContainer,
  },
  infoValue: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: '500',
  },
});
