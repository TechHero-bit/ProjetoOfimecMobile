import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import ScreenHeader from '@/src/components/ScreenHeader';
import Card from '@/src/components/Card';
import { createVeiculo as svcCreate, getVeiculo as svcGet, updateVeiculo as svcUpdate, deleteVeiculo as svcDelete } from '@/src/services/veiculo.service';
import { listClientes } from '@/src/services/cliente.service';
import { COLORS, BORDER_RADIUS } from '@/src/theme';
import type { Veiculo, Cliente } from '@/src/types';

export default function VeiculoFormScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!isNew);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<Partial<Veiculo>>({ 
    placa: '', marca: '', modelo: '', ano: new Date().getFullYear(), cor: '', combustivel: '', quilometragem: 0, clienteId: undefined 
  });

  useEffect(() => {
    // Carregar clientes primeiro
    listClientes()
      .then(setClientes)
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar a lista de clientes'));

    if (!isNew) {
      const numericId = Number(id);
      setInitialLoading(true);
      svcGet(numericId)
        .then((data) => {
          if (data) setForm(data);
        })
        .catch(() => {
          Alert.alert('Erro', 'Não foi possível carregar o veículo');
          router.back();
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, isNew, router]);

  async function handleSave() {
    if (!form.placa || !form.marca || !form.modelo || !form.clienteId) {
      Alert.alert('Atenção', 'Placa, Marca, Modelo e Cliente são campos obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      if (isNew) {
        await svcCreate(form as any);
        Alert.alert('Sucesso', 'Veículo criado com sucesso!');
      } else {
        await svcUpdate(Number(id), form as any);
        Alert.alert('Sucesso', 'Veículo atualizado com sucesso!');
      }
      router.back();
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao salvar o veículo');
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Excluir Veículo',
      'Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.',
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
              Alert.alert('Erro', 'Não foi possível excluir o veículo. Verifique se ele possui ordens de serviço associadas.');
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
        title={isNew ? 'Novo Veículo' : 'Editar Veículo'} 
        subtitle={isNew ? 'Cadastre um novo veículo' : `ID: ${id}`}
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
              <Card title="Identificação" style={styles.sectionCard}>
                <View style={styles.row}>
                  <View style={[styles.col, { flex: 2 }]}>
                    <Input 
                      label="Placa *" 
                      icon="car-outline"
                      placeholder="ABC1D23" 
                      autoCapitalize="characters"
                      value={form.placa} 
                      onChangeText={(t) => setForm((s) => ({ ...s, placa: t }))} 
                    />
                  </View>
                  <View style={[styles.col, { flex: 1 }]}>
                    <Input 
                      label="Ano" 
                      placeholder="Ex: 2020" 
                      keyboardType="numeric"
                      value={form.ano?.toString()} 
                      onChangeText={(t) => setForm((s) => ({ ...s, ano: parseInt(t) || undefined }))} 
                    />
                  </View>
                </View>
                
                <View style={styles.row}>
                  <View style={styles.col}>
                    <Input 
                      label="Marca *" 
                      placeholder="Ex: Chevrolet" 
                      autoCapitalize="words"
                      value={form.marca} 
                      onChangeText={(t) => setForm((s) => ({ ...s, marca: t }))} 
                    />
                  </View>
                  <View style={styles.col}>
                    <Input 
                      label="Modelo *" 
                      placeholder="Ex: Onix 1.0" 
                      autoCapitalize="words"
                      value={form.modelo} 
                      onChangeText={(t) => setForm((s) => ({ ...s, modelo: t }))} 
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.col}>
                    <Input 
                      label="Cor" 
                      placeholder="Ex: Prata" 
                      value={form.cor} 
                      onChangeText={(t) => setForm((s) => ({ ...s, cor: t }))} 
                    />
                  </View>
                  <View style={styles.col}>
                    <Input 
                      label="Combustível" 
                      placeholder="Ex: Flex" 
                      value={form.combustivel} 
                      onChangeText={(t) => setForm((s) => ({ ...s, combustivel: t }))} 
                    />
                  </View>
                </View>

                <Input 
                  label="Quilometragem (Km)" 
                  icon="speedometer-outline"
                  placeholder="Ex: 50000" 
                  keyboardType="numeric"
                  value={form.quilometragem?.toString()} 
                  onChangeText={(t) => setForm((s) => ({ ...s, quilometragem: parseInt(t) || 0 }))} 
                />
              </Card>

              <Card title="Proprietário" style={styles.sectionCard}>
                <Text style={styles.label}>Cliente Selecionado *</Text>
                {/* Num app real, usaríamos um Picker (Dropdown) ou um modal de seleção. 
                    Por simplicidade, vamos renderizar uma lista horizontal de clientes caso seja novo,
                    ou mostrar o cliente atual. */}
                {clientes.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientList}>
                    {clientes.map(c => (
                      <Card 
                        key={c.id} 
                        style={[
                          styles.clientCard, 
                          form.clienteId === c.id && styles.clientCardSelected
                        ]}
                        onPress={() => setForm(s => ({ ...s, clienteId: c.id }))}
                      >
                        <Text style={[
                          styles.clientName,
                          form.clienteId === c.id && styles.clientNameSelected
                        ]}>{c.nome}</Text>
                        <Text style={[
                          styles.clientCpf,
                          form.clienteId === c.id && styles.clientCpfSelected
                        ]}>{c.cpf}</Text>
                      </Card>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.emptyText}>Nenhum cliente cadastrado. Cadastre um cliente primeiro.</Text>
                )}
              </Card>

              <View style={styles.actions}>
                <Button 
                  title="Salvar Veículo" 
                  icon="save-outline"
                  onPress={handleSave} 
                  loading={loading} 
                />
                
                {!isNew && (
                  <Button 
                    title="Excluir Veículo" 
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
  label: { 
    color: COLORS.text, 
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  clientList: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  clientCard: {
    marginRight: 12,
    width: 200,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: COLORS.gray100,
  },
  clientCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  clientName: {
    fontWeight: '700',
    color: COLORS.text,
  },
  clientNameSelected: {
    color: COLORS.primary,
  },
  clientCpf: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  clientCpfSelected: {
    color: COLORS.primary,
  },
  emptyText: {
    color: COLORS.danger,
    fontStyle: 'italic',
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
