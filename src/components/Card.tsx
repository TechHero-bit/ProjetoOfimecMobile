import { BORDER_RADIUS, COLORS, SHADOWS, SPACING } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  title?: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  children?: React.ReactNode;
  style?: any;
};

export default function Card({ title, subtitle, icon, iconColor = COLORS.primary, rightElement, onPress, children, style }: Props) {
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
      {(title || subtitle || icon) && (
        <View style={styles.header}>
          {icon && (
            <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
              <Ionicons name={icon} size={24} color={iconColor} />
            </View>
          )}
          <View style={styles.headerTextContainer}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
        </View>
      )}
      {children && (
        <View style={[(title || subtitle || icon) ? styles.contentWithHeader : styles.content]}>
          {children}
        </View>
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    ...SHADOWS.level1,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.8,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.onSurface,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.onSurfaceVariant,
  },
  rightElement: {
    marginLeft: SPACING.md,
  },
  content: {
    padding: SPACING.md,
  },
  contentWithHeader: {
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
});
