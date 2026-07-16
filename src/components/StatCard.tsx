import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColors?: [string, string]; // [iconColor, bgColor]
  onPress?: () => void;
};

export default function StatCard({ title, value, icon, iconColors, onPress }: Props) {
  const Container: any = onPress ? Pressable : View;
  const [iconColor = COLORS.secondaryFixed, bgColor = COLORS.secondaryFixed] = iconColors || [];

  return (
    <Container
      style={({ pressed }: any) => [
        styles.container,
        pressed && onPress && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
        <Ionicons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>{value}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.level1,
    flex: 1,
    minWidth: '45%',
    aspectRatio: 4 / 3,
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    width: '100%',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
    fontWeight: '500',
  },
});
