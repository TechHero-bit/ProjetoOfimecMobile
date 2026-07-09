import { COLORS, BORDER_RADIUS } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  label?: string;
  value?: string | number;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: any;
  secureTextEntry?: boolean;
  style?: any;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
};

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  secureTextEntry,
  style,
  icon,
  error,
  autoCapitalize,
  editable = true,
}: Props) {
  return (
    <View style={[styles.wrapper, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[
        styles.inputContainer,
        error ? styles.inputError : null,
        !editable ? styles.inputDisabled : null
      ]}>
        {icon && (
          <Ionicons name={icon} size={20} color={COLORS.textSecondary} style={styles.icon} />
        )}
        <TextInput
          value={value !== undefined ? String(value) : ''}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          style={[styles.input, multiline && styles.inputMultiline]}
          multiline={multiline}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', marginBottom: 16 },
  label: { 
    color: COLORS.text, 
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: COLORS.danger,
    backgroundColor: `${COLORS.danger}05`,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  icon: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    padding: 16,
    color: COLORS.text,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
