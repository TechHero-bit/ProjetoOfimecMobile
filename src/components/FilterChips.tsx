import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { ScrollView, StyleSheet, Text, Pressable } from 'react-native';

export type FilterOption = {
  id: string;
  label: string;
};

type Props = {
  options: FilterOption[];
  selectedId: string;
  onSelect: (id: string) => void;
  style?: any;
};

export default function FilterChips({ options, selectedId, onSelect, style }: Props) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {options.map((option) => {
        const isActive = option.id === selectedId;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={({ pressed }) => [
              styles.chip,
              isActive ? styles.chipActive : styles.chipInactive,
              pressed && styles.pressed
            ]}
          >
            <Text style={[
              styles.text,
              isActive ? styles.textActive : styles.textInactive
            ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  chipInactive: {
    backgroundColor: COLORS.surfaceContainer,
    borderColor: COLORS.surfaceVariant,
  },
  chipActive: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    ...TYPOGRAPHY.labelCaps,
  },
  textInactive: {
    color: COLORS.onSurface,
  },
  textActive: {
    color: COLORS.primary,
  },
});
