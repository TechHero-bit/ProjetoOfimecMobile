import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/src/contexts/AuthContext';
import { COLORS } from '@/src/theme';

import ScreenHeader from '@/src/components/ScreenHeader';
import Card from '@/src/components/Card';
import Button from '@/src/components/Button';

export default function PerfilScreen() {
  const { user, signOutUser } = useAuth();

  async function handleSignOut() {
    await signOutUser();
    router.replace('/login');
  }

  const userInitial = user?.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Meu Perfil" icon="person" />
      
      <View style={styles.container}>
        <Card style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{userInitial}</Text>
          </View>
          
          <Text style={styles.emailText}>{user?.email ?? 'Usuário desconhecido'}</Text>
          <Text style={styles.roleText}>Administrador</Text>
        </Card>

        <View style={styles.menuContainer}>
          <Card 
            title="Configurações da Oficina" 
            icon="settings-outline" 
            style={styles.menuItem} 
            rightElement={<Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />}
          />
          
          <Card 
            title="Suporte Técnico" 
            icon="help-circle-outline" 
            style={styles.menuItem}
            rightElement={<Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />}
          />
        </View>

        <Button 
          title="Sair do Aplicativo" 
          icon="log-out-outline" 
          variant="outline" 
          onPress={handleSignOut} 
          style={styles.logoutBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: COLORS.gray100,
  },
  profileCard: {
    alignItems: 'center',
    padding: 32,
    marginBottom: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.white,
  },
  emailText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  menuContainer: {
    gap: 12,
    marginBottom: 32,
  },
  menuItem: {
    marginBottom: 0,
  },
  logoutBtn: {
    marginTop: 'auto',
  },
});
