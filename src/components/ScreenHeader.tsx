import { COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
};

export default function ScreenHeader({ title, subtitle, rightElement, icon }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        {icon && <Ionicons name={icon} size={32} color={COLORS.primary} style={styles.icon} />}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightElement && <View style={styles.rightContainer}>{rightElement}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 0,
    gap: SPACING.sm,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: SPACING.sm,
  },
  icon: {
    marginTop: SPACING.xs,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.onSurface,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  rightContainer: {
    marginLeft: SPACING.md,
  },
});
