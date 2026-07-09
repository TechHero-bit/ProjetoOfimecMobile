import { BORDER_RADIUS, COLORS, SHADOWS } from '@/src/theme';
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
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.card,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: COLORS.gray100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  rightElement: {
    marginLeft: 12,
  },
  content: {
    padding: 16,
  },
  contentWithHeader: {
    padding: 16,
    paddingTop: 12,
  },
});
