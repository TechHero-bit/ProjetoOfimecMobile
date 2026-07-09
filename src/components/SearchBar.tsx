import { COLORS, BORDER_RADIUS } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View, Pressable } from 'react-native';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: any;
};

export default function SearchBar({ value, onChangeText, placeholder = 'Buscar...', style }: Props) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.icon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        style={styles.input}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} style={styles.clearButton}>
          <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: 12,
    height: 44,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.text,
    fontSize: 15,
  },
  clearButton: {
    padding: 4,
  },
});
