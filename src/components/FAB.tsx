import { COLORS, SHADOWS, SPACING } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

type Props = {
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: any;
};

export default function FAB({ icon = 'add', onPress, style }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.fab,
        pressed && styles.pressed,
        style
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={28} color={COLORS.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: SPACING.lg,
    right: SPACING.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.level2,
    zIndex: 40,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
