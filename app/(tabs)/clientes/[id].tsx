import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import ScreenHeader from '@/src/components/ScreenHeader';
import Card from '@/src/components/Card';
import { createCliente as svcCreate, getCliente as svcGet, updateCliente as svcUpdate, deleteCliente as svcDelete } from '@/src/services/cliente.service';
import { COLORS } from '@/src/theme';
import type { Cliente } from '@/src/types';

export default function ClienteFormScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!isNew);
  const [form, setForm] = useState<Partial<Cliente>>({ 
    nome: '', cpf: '', telefone: '', email: '', endereco: '', cidade: '', estado: '', cep: '' 
  });

  useEffect(() => {
    if (!isNew) {
      const numericId = Number(id);
      setInitialLoading(true);
      svcGet(numericId)
        .then((data) => {
          if (data) setForm(data);
        })
        .catch(() => {
          Alert.alert('Erro', 'Não foi possível carregar o cliente');
          router.back();
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, isNew, router]);

  async function handleSave() {
    if (!form.nome || !form.telefone) {
      Alert.alert('Atenção', 'Nome e Telefone são campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      if (isNew) {
        await svcCreate(form as any);
        Alert.alert('Sucesso', 'Cliente criado com sucesso!');
      } else {
        await svcUpdate(Number(id), form as any);
        Alert.alert('Sucesso', 'Cliente atualizado com sucesso!');
      }
      router.back();
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao salvar o cliente');
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Excluir Cliente',
      'Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await svcDelete(Number(id));
              router.back();
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível excluir o cliente. Verifique se ele possui veículos ou ordens de serviço.');
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader 
        title={isNew ? 'Novo Cliente' : 'Editar Cliente'} 
        subtitle={isNew ? 'Cadastre um novo cliente' : `ID: ${id}`}
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {initialLoading ? (
            <View style={styles.loadingContainer}>
              <Button title="Carregando..." loading={true} variant="outline" />
            </View>
          ) : (
            <>
              <Card title="Dados Pessoais" style={styles.sectionCard}>
                <Input 
                  label="Nome Completo *" 
                  icon="person-outline"
                  placeholder="Ex: João da Silva" 
                  autoCapitalize="words"
                  value={form.nome} 
                  onChangeText={(t) => setForm((s) => ({ ...s, nome: t }))} 
                />
                
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Input 
                      label="CPF" 
                      icon="card-outline"
                      placeholder="000.000.000-00" 
                      keyboardType="numeric"
                      value={form.cpf} 
                      onChangeText={(t) => setForm((s) => ({ ...s, cpf: t }))} 
                    />
                  </View>
                  <View style={styles.col}>
                    <Input 
                      label="Telefone *" 
                      icon="call-outline"
                      placeholder="(00) 00000-0000" 
                      keyboardType="phone-pad"
                      value={form.telefone} 
                      onChangeText={(t) => setForm((s) => ({ ...s, telefone: t }))} 
                    />
                  </View>
                </View>
                
                <Input 
                  label="E-mail" 
                  icon="mail-outline"
                  placeholder="joao@exemplo.com" 
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={form.email} 
                  onChangeText={(t) => setForm((s) => ({ ...s, email: t }))} 
                />
              </Card>

              <Card title="Endereço" style={styles.sectionCard}>
                <Input 
                  label="CEP" 
                  icon="location-outline"
                  placeholder="00000-000" 
                  keyboardType="numeric"
                  value={form.cep} 
                  onChangeText={(t) => setForm((s) => ({ ...s, cep: t }))} 
                />
                
                <Input 
                  label="Logradouro" 
                  icon="home-outline"
                  placeholder="Rua, Avenida, Número, Complemento" 
                  autoCapitalize="sentences"
                  value={form.endereco} 
                  onChangeText={(t) => setForm((s) => ({ ...s, endereco: t }))} 
                />

                <View style={styles.row}>
                  <View style={[styles.col, { flex: 2 }]}>
                    <Input 
                      label="Cidade" 
                      placeholder="Nome da cidade" 
                      value={form.cidade} 
                      onChangeText={(t) => setForm((s) => ({ ...s, cidade: t }))} 
                    />
                  </View>
                  <View style={[styles.col, { flex: 1 }]}>
                    <Input 
                      label="UF" 
                      placeholder="EX: SP" 
                      autoCapitalize="characters"
                      value={form.estado} 
                      onChangeText={(t) => setForm((s) => ({ ...s, estado: t }))} 
                    />
                  </View>
                </View>
              </Card>

              <View style={styles.actions}>
                <Button 
                  title="Salvar Cliente" 
                  icon="save-outline"
                  onPress={handleSave} 
                  loading={loading} 
                />
                
                {!isNew && (
                  <Button 
                    title="Excluir Cliente" 
                    icon="trash-outline"
                    variant="danger"
                    onPress={confirmDelete} 
                    disabled={loading}
                    style={styles.deleteBtn}
                  />
                )}
                
                <Button 
                  title="Cancelar" 
                  variant="outline"
                  onPress={() => router.back()} 
                  disabled={loading}
                  style={styles.cancelBtn}
                />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  keyboardView: { flex: 1 },
  container: { 
    padding: 20, 
    backgroundColor: COLORS.gray100, 
    gap: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionCard: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  deleteBtn: {
    marginTop: 8,
  },
  cancelBtn: {
    marginTop: 4,
  },
});
