import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Button from '@/src/components/Button';
import Input from '@/src/components/Input';
import ScreenHeader from '@/src/components/ScreenHeader';
import Card from '@/src/components/Card';
import StatusBadge from '@/src/components/StatusBadge';
import { createOrdemServico as svcCreate, getOrdemServico as svcGet, updateOrdemServico as svcUpdate, deleteOrdemServico as svcDelete } from '@/src/services/ordem-servico.service';
import { listClientes } from '@/src/services/cliente.service';
import { listVeiculos } from '@/src/services/veiculo.service';
import { COLORS, BORDER_RADIUS } from '@/src/theme';
import type { OrdemServico, Cliente, Veiculo, StatusOS, ServicoItem } from '@/src/types';

export default function OrdemFormScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!isNew);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  
  // Lista de itens de serviço temporária para a UI
  const [itensServico, setItensServico] = useState<Partial<ServicoItem>[]>([]);
  const [novoItemDesc, setNovoItemDesc] = useState('');
  const [novoItemValor, setNovoItemValor] = useState('');

  const [form, setForm] = useState<Partial<OrdemServico>>({ 
    clienteId: undefined, 
    veiculoId: undefined,
    status: 'pendente',
    numeroOs: isNew ? `OS-${new Date().getTime().toString().slice(-6)}` : '',
    valorTotal: 0,
    valorPago: 0
  });

  useEffect(() => {
    // Carregar dados auxiliares
    Promise.all([listClientes(), listVeiculos()])
      .then(([clientesData, veiculosData]) => {
        setClientes(clientesData);
        setVeiculos(veiculosData);
      })
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar listas auxiliares'));

    if (!isNew) {
      const numericId = Number(id);
      setInitialLoading(true);
      svcGet(numericId)
        .then((data) => {
          if (data) {
            setForm(data);
            // Simular carga de itens (no db real deveria vir no get)
            // Se houvesse itens na resposta da API
          }
        })
        .catch(() => {
          Alert.alert('Erro', 'Não foi possível carregar a ordem de serviço');
          router.back();
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, isNew, router]);

  const veiculosDoCliente = form.clienteId 
    ? veiculos.filter(v => v.clienteId === form.clienteId)
    : [];

  const handleAddItem = () => {
    if (!novoItemDesc || !novoItemValor) return;
    
    const valorNum = parseFloat(novoItemValor.replace(',', '.'));
    if (isNaN(valorNum)) {
      Alert.alert('Atenção', 'Valor inválido');
      return;
    }

    const newItem: Partial<ServicoItem> = {
      descricao: novoItemDesc,
      valor: valorNum,
    };

    const newItensList = [...itensServico, newItem];
    setItensServico(newItensList);
    setNovoItemDesc('');
    setNovoItemValor('');
    
    // Atualiza valor total
    const total = newItensList.reduce((sum, item) => sum + (item.valor || 0), 0);
    setForm(prev => ({ ...prev, valorTotal: total }));
  };

  const handleRemoveItem = (index: number) => {
    const newItensList = [...itensServico];
    newItensList.splice(index, 1);
    setItensServico(newItensList);
    
    // Atualiza valor total
    const total = newItensList.reduce((sum, item) => sum + (item.valor || 0), 0);
    setForm(prev => ({ ...prev, valorTotal: total }));
  };

  async function handleSave() {
    if (!form.clienteId || !form.veiculoId) {
      Alert.alert('Atenção', 'Cliente e Veículo são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      if (isNew) {
        await svcCreate(form as any); // Simplificado para o escopo
        Alert.alert('Sucesso', 'Ordem criada com sucesso!');
      } else {
        await svcUpdate(Number(id), form as any);
        Alert.alert('Sucesso', 'Ordem atualizada com sucesso!');
      }
      router.back();
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      'Excluir Ordem de Serviço',
      'Tem certeza que deseja excluir esta OS? Esta ação não pode ser desfeita.',
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
              Alert.alert('Erro', 'Não foi possível excluir a OS.');
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const STATUS_OPTIONS: { value: StatusOS; label: string; color: string }[] = [
    { value: 'pendente', label: 'Pendente', color: '#ffab40' },
    { value: 'em_andamento', label: 'Em Andamento', color: '#40c4ff' },
    { value: 'concluida', label: 'Concluída', color: '#00e676' },
    { value: 'cancelada', label: 'Cancelada', color: '#ff5252' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader 
        title={isNew ? 'Nova Ordem' : 'Editar Ordem'} 
        subtitle={form.numeroOs || `ID: ${id}`}
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
              <Card title="Status" style={styles.sectionCard}>
                <View style={styles.statusGrid}>
                  {STATUS_OPTIONS.map(opt => (
                    <Pressable 
                      key={opt.value}
                      style={[
                        styles.statusOption,
                        form.status === opt.value && { borderColor: opt.color, backgroundColor: `${opt.color}15` }
                      ]}
                      onPress={() => setForm(s => ({ ...s, status: opt.value }))}
                    >
                      <View style={[styles.statusDot, { backgroundColor: opt.color }]} />
                      <Text style={[
                        styles.statusText,
                        form.status === opt.value && { color: opt.color, fontWeight: '700' }
                      ]}>{opt.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </Card>

              <Card title="Cliente e Veículo" style={styles.sectionCard}>
                <Text style={styles.label}>Cliente Selecionado *</Text>
                {clientes.length > 0 ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
                    {clientes.map(c => (
                      <Pressable 
                        key={c.id} 
                        style={[
                          styles.selectableCard, 
                          form.clienteId === c.id && styles.selectableCardSelected
                        ]}
                        onPress={() => {
                          setForm(s => ({ ...s, clienteId: c.id, veiculoId: undefined })); // reset veiculo on cliente change
                        }}
                      >
                        <Text style={[styles.selectableName, form.clienteId === c.id && styles.selectableTextSelected]}>{c.nome}</Text>
                        <Text style={[styles.selectableSub, form.clienteId === c.id && styles.selectableTextSelected]}>{c.cpf}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <Text style={styles.emptyText}>Nenhum cliente cadastrado.</Text>
                )}

                {form.clienteId && (
                  <>
                    <Text style={[styles.label, { marginTop: 16 }]}>Veículo *</Text>
                    {veiculosDoCliente.length > 0 ? (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalList}>
                        {veiculosDoCliente.map(v => (
                          <Pressable 
                            key={v.id} 
                            style={[
                              styles.selectableCard, 
                              form.veiculoId === v.id && styles.selectableCardSelected
                            ]}
                            onPress={() => setForm(s => ({ ...s, veiculoId: v.id }))}
                          >
                            <Text style={[styles.selectableName, form.veiculoId === v.id && styles.selectableTextSelected]}>
                              {v.marca} {v.modelo}
                            </Text>
                            <Text style={[styles.selectableSub, form.veiculoId === v.id && styles.selectableTextSelected]}>
                              {v.placa}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    ) : (
                      <View style={styles.warningBox}>
                        <Ionicons name="warning" size={20} color={COLORS.warning || '#ffab40'} />
                        <Text style={styles.warningText}>Este cliente não possui veículos cadastrados.</Text>
                      </View>
                    )}
                  </>
                )}
              </Card>

              <Card title="Itens e Serviços" style={styles.sectionCard}>
                {itensServico.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <View style={styles.itemDescCol}>
                      <Text style={styles.itemDesc}>{item.descricao}</Text>
                    </View>
                    <View style={styles.itemValCol}>
                      <Text style={styles.itemVal}>{formatCurrency(item.valor)}</Text>
                    </View>
                    <Pressable onPress={() => handleRemoveItem(index)} style={styles.itemRemoveBtn}>
                      <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                    </Pressable>
                  </View>
                ))}

                <View style={styles.addItemForm}>
                  <View style={[styles.col, { flex: 2, marginRight: 8 }]}>
                    <Input 
                      placeholder="Descrição do serviço/peça" 
                      value={novoItemDesc}
                      onChangeText={setNovoItemDesc}
                      style={{ marginBottom: 0 }}
                    />
                  </View>
                  <View style={[styles.col, { flex: 1, marginRight: 8 }]}>
                    <Input 
                      placeholder="R$ Valor" 
                      keyboardType="numeric"
                      value={novoItemValor}
                      onChangeText={setNovoItemValor}
                      style={{ marginBottom: 0 }}
                    />
                  </View>
                  <Button 
                    title="" 
                    icon="add" 
                    onPress={handleAddItem}
                    style={styles.addBtn}
                  />
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Valor Total</Text>
                  <Text style={styles.totalValue}>{formatCurrency(form.valorTotal)}</Text>
                </View>
              </Card>

              <View style={styles.actions}>
                <Button 
                  title="Salvar Ordem de Serviço" 
                  icon="save-outline"
                  onPress={handleSave} 
                  loading={loading} 
                />
                
                {!isNew && (
                  <Button 
                    title="Excluir OS" 
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
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.text,
  },
  horizontalList: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  selectableCard: {
    marginRight: 12,
    width: 180,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: COLORS.gray100,
  },
  selectableCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  selectableName: {
    fontWeight: '700',
    color: COLORS.text,
  },
  selectableSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  selectableTextSelected: {
    color: COLORS.primary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  warningText: {
    color: '#e65100',
    fontSize: 14,
    flex: 1,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  itemDescCol: {
    flex: 2,
  },
  itemDesc: {
    fontSize: 14,
    color: COLORS.text,
  },
  itemValCol: {
    flex: 1,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  itemVal: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemRemoveBtn: {
    padding: 4,
  },
  addItemForm: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  addBtn: {
    paddingHorizontal: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.success || '#00e676',
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
