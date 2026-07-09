import { BORDER_RADIUS, COLORS } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  iconColors: [string, string]; // [iconColor, bgColor]
  onPress?: () => void;
};

export default function StatCard({ title, value, icon, iconColors, onPress }: Props) {
  const Container: any = onPress ? Pressable : View;
  const [iconColor, bgColor] = iconColors;

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
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    flex: 1,
    minWidth: '45%',
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: COLORS.gray100,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
