import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import { useAuth } from '@/src/contexts/AuthContext';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '@/src/theme';

export default function LoginScreen() {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSignIn() {
    setError('');
    
    // Basic validation
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar. Verifique suas credenciais.');
    }
  }

  const isFormValid = email.length > 0 && password.length >= 6;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>OM</Text>
          </View>
          <Text style={styles.title}>Ofimec Mobile</Text>
          <Text style={styles.subtitle}>Gestão de oficina inteligente</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesse sua conta</Text>
          
          <Input
            label="E-mail"
            icon="mail-outline"
            placeholder="Seu e-mail cadastrado"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Input
            label="Senha"
            icon="lock-closed-outline"
            placeholder="Sua senha de acesso"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Button 
            title="Entrar" 
            onPress={handleSignIn} 
            loading={loading}
            disabled={!isFormValid}
            style={styles.button}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl + SPACING.lg,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.button,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: COLORS.onPrimary,
    letterSpacing: -1,
  },
  title: {
    ...TYPOGRAPHY.headlineLg,
    color: COLORS.onSurface,
  },
  subtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    ...SHADOWS.level2,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  cardTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: `${COLORS.error}15`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.error,
    ...TYPOGRAPHY.bodyMd,
    textAlign: 'center',
    fontWeight: '600',
  },
  button: {
    marginTop: SPACING.md,
  },
});
