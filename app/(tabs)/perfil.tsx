import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/src/contexts/AuthContext';
import { COLORS } from '@/src/theme';

export default function PerfilScreen() {
  const { user, signOutUser } = useAuth();

  async function handleSignOut() {
    await signOutUser();
    router.replace('/login');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.email}>{user?.email ?? 'Sem usuário'}</Text>
      <Pressable style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: COLORS.background },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.primary },
  email: { marginTop: 8, color: COLORS.textSecondary },
  button: { marginTop: 20, backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  buttonText: { color: COLORS.white, fontWeight: '700' },
});
