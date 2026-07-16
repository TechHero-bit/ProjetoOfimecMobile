import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  style?: any;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
};

export default function Button({ title, onPress, loading, style, variant = 'primary', icon, disabled }: Props) {
  const getBgColor = () => {
    if (disabled) return COLORS.outlineVariant;
    if (variant === 'primary') return COLORS.primary;
    if (variant === 'secondary') return COLORS.secondaryContainer;
    if (variant === 'danger') return COLORS.error;
    if (variant === 'outline') return 'transparent';
    return COLORS.primary;
  };

  const getTextColor = () => {
    if (disabled) return COLORS.onSurfaceVariant;
    if (variant === 'outline') return COLORS.primary;
    if (variant === 'secondary') return COLORS.onSecondaryContainer;
    if (variant === 'danger') return COLORS.onError;
    return COLORS.onPrimary;
  };

  const getBorderColor = () => {
    if (variant === 'outline') return COLORS.outline;
    return 'transparent';
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBgColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
      disabled={loading || disabled}
    >
      <View style={styles.content}>
        {icon && !loading && (
          <Ionicons name={icon} size={20} color={getTextColor()} style={styles.icon} />
        )}
        <Text style={[styles.text, { color: getTextColor() }]}>
          {loading ? 'Carregando...' : title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md - 2,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.button,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: SPACING.sm,
  },
  text: {
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
