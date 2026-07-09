import { COLORS } from '@/src/theme';
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
    if (disabled) return COLORS.border;
    if (variant === 'primary') return COLORS.primary;
    if (variant === 'secondary') return COLORS.secondary;
    if (variant === 'danger') return COLORS.danger;
    if (variant === 'outline') return 'transparent';
    return COLORS.primary;
  };

  const getTextColor = () => {
    if (disabled) return COLORS.textSecondary;
    if (variant === 'outline') return COLORS.primary;
    return COLORS.white;
  };

  const getBorderColor = () => {
    if (variant === 'outline') return COLORS.primary;
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
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
