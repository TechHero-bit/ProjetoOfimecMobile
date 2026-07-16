import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  onMenuPress?: () => void;
};

export default function AppHeader({ onMenuPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Pressable
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        onPress={onMenuPress}
      >
        <Ionicons name="menu" size={24} color={COLORS.primary} />
      </Pressable>

      <Text style={styles.title}>OficeMec</Text>

      <View style={styles.avatarContainer}>
        <Ionicons name="person" size={20} color={COLORS.onSurfaceVariant} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
  },
  iconButton: {
    padding: SPACING.xs,
    borderRadius: 20,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.primary,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
  },
});
