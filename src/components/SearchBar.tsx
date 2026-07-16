import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  style?: any;
};

export default function SearchBar({ value, onChangeText, placeholder = 'Buscar...', rightIcon, onRightIconPress, style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={20} color={COLORS.onSurfaceVariant} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={`${COLORS.onSurfaceVariant}80`} // 50% opacity per design
        style={styles.input}
      />
      {value.length > 0 && !rightIcon && (
        <Pressable onPress={() => onChangeText('')} style={styles.iconButton}>
          <Ionicons name="close-circle" size={18} color={COLORS.onSurfaceVariant} />
        </Pressable>
      )}
      {rightIcon && (
        <Pressable onPress={onRightIconPress} style={styles.iconButton}>
          <Ionicons name={rightIcon} size={20} color={COLORS.onSurfaceVariant} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainer,
    borderTopLeftRadius: BORDER_RADIUS.md,
    borderTopRightRadius: BORDER_RADIUS.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
    paddingHorizontal: SPACING.md,
    height: 56,
  },
  icon: {
    marginRight: SPACING.sm,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.onSurface,
    ...TYPOGRAPHY.bodyMd,
  },
  iconButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});
