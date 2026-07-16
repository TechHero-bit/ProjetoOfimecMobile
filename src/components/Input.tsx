import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
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
          <Ionicons name={icon} size={20} color={COLORS.onSurfaceVariant} style={styles.icon} />
        )}
        <TextInput
          value={value !== undefined ? String(value) : ''}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.onSurfaceVariant}
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
  wrapper: { 
    width: '100%', 
    marginBottom: SPACING.lg 
  },
  label: { 
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface, 
    marginBottom: SPACING.sm,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: `${COLORS.error}08`,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  icon: {
    paddingLeft: SPACING.md,
  },
  input: {
    flex: 1,
    padding: SPACING.md,
    color: COLORS.onSurface,
    ...TYPOGRAPHY.bodyMd,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    color: COLORS.error,
    ...TYPOGRAPHY.labelMd,
    marginTop: SPACING.xs,
    fontWeight: '600',
  },
});
