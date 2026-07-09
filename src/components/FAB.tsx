import { COLORS } from '@/src/theme';
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
      <Ionicons name={icon} size={28} color={COLORS.white} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});
