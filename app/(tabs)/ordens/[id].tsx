import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { listClientes } from '@/src/services/cliente.service';
import {
  createOrdemServico as svcCreate,
  deleteOrdemServico as svcDelete,
  getOrdemServico as svcGet,
  updateOrdemServico as svcUpdate,
} from '@/src/services/ordem-servico.service';
import { listVeiculos } from '@/src/services/veiculo.service';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '@/src/theme';
import type { Cliente, OrdemServico, ServicoItem, StatusOS, Veiculo } from '@/src/types';

// ─── Styled Input ────────────────────────────────────────────
function DarkInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  editable = true,
}: {
  label?: string;
  value?: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  editable?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={inputStyles.wrapper}>
      {label && <Text style={inputStyles.label}>{label}</Text>}
      <TextInput
        style={[inputStyles.input, focused && inputStyles.inputFocused, !editable && inputStyles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.onSecondaryFixedVariant}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: { gap: SPACING.xs },
  label: { ...TYPOGRAPHY.labelCaps, color: COLORS.onSurfaceVariant, textTransform: 'uppercase' },
  input: {
    backgroundColor: COLORS.inputBg,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.inputBorder,
    borderTopLeftRadius: BORDER_RADIUS.default,
    borderTopRightRadius: BORDER_RADIUS.default,
    color: COLORS.onSurface,
    ...TYPOGRAPHY.bodyMd,
    height: 48,
    paddingHorizontal: SPACING.md,
  },
  inputFocused: {
    borderBottomColor: COLORS.primaryContainer,
  },
  inputDisabled: {
    opacity: 0.6,
  },
});

// ─── Status Grid Option ──────────────────────────────────────
function StatusGridOption({
  label,
  value,
  icon,
  currentValue,
  activeColor,
  activeBg,
  onSelect,
  disabled = false,
}: {
  label: string;
  value: StatusOS;
  icon: keyof typeof MaterialIcons.glyphMap;
  currentValue: StatusOS;
  activeColor: string;
  activeBg: string;
  onSelect: (v: StatusOS) => void;
  disabled?: boolean;
}) {
  const isSelected = value === currentValue;
  return (
    <Pressable
      style={[
        statusStyles.option,
        isSelected && { borderColor: activeColor, backgroundColor: activeBg },
        disabled && { opacity: 0.5 },
      ]}
      onPress={() => onSelect(value)}
      disabled={disabled}
    >
      <MaterialIcons
        name={icon}
        size={24}
        color={isSelected ? activeColor : COLORS.onSurfaceVariant}
      />
      <Text style={[statusStyles.text, isSelected && { color: activeColor, fontWeight: '700' }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const statusStyles = StyleSheet.create({
  option: {
    width: '48%',
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  text: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurface,
  },
});

// ─── Main Screen ─────────────────────────────────────────────
export default function OrdemFormScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const isNew = !id || id === 'new';
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!isNew);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);

  const [itensServico, setItensServico] = useState<Partial<ServicoItem>[]>([]);
  const [novoItemDesc, setNovoItemDesc] = useState('');
  const [novoItemQtd, setNovoItemQtd] = useState('1');
  const [novoItemValor, setNovoItemValor] = useState('');

  const [desconto, setDesconto] = useState(0);

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);

  const [form, setForm] = useState<Partial<OrdemServico>>({
    clienteId: undefined,
    veiculoId: undefined,
    status: 'pendente',
    numeroOs: isNew ? `OS-${new Date().getTime().toString().slice(-6)}` : '',
    valorTotal: 0,
    situacao: '',
    descricaoProblema: '',
  });

  useEffect(() => {
    Promise.all([listClientes(), listVeiculos()])
      .then(([clientesData, veiculosData]) => {
        setClientes(clientesData);
        setVeiculos(veiculosData);
      })
      .catch(() => Alert.alert('Erro', 'Não foi possível carregar listas auxiliares'));

    if (isNew) {
      setInitialLoading(false);
      setForm({
        clienteId: undefined,
        veiculoId: undefined,
        status: 'pendente',
        numeroOs: `OS-${new Date().getTime().toString().slice(-6)}`,
        valorTotal: 0,
        situacao: '',
        descricaoProblema: '',
      });
      setItensServico([]);
      setDesconto(0);
      setNovoItemDesc('');
      setNovoItemQtd('1');
      setNovoItemValor('');
      setIsReadOnly(false);
    } else {
      const numericId = Number(id);
      setInitialLoading(true);
      svcGet(numericId)
        .then((data) => {
          if (data) {
            setForm(data);
            if (data.servicos) {
              setItensServico(data.servicos);
            }
            if (data.status === 'concluida' || data.status === 'cancelada') {
              setIsReadOnly(true);
            }
          }
        })
        .catch(() => {
          Alert.alert('Erro', 'Não foi possível carregar a ordem de serviço');
          navigation.goBack();
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, isNew, navigation]);

  const veiculosDoCliente = form.clienteId ? veiculos.filter((v) => v.clienteId === form.clienteId) : [];
  const clienteSelecionado = clientes.find((c) => c.id === form.clienteId);
  const veiculoSelecionado = veiculos.find((v) => v.id === form.veiculoId);

  // Recalculate totals
  const subtotal = itensServico.reduce((sum, item) => sum + (item.valor || 0), 0);
  const totalGeral = Math.max(0, subtotal - desconto);

  useEffect(() => {
    setForm((prev) => ({ ...prev, valorTotal: totalGeral }));
  }, [totalGeral]);

  const handleAddItem = () => {
    if (!novoItemDesc || !novoItemValor) return;

    const valorNum = parseFloat(novoItemValor.replace(',', '.'));
    const qtdNum = parseInt(novoItemQtd) || 1;
    if (isNaN(valorNum)) {
      Alert.alert('Atenção', 'Valor inválido');
      return;
    }

    const newItem: Partial<ServicoItem> = {
      descricao: `${qtdNum}x ${novoItemDesc}`,
      valor: valorNum * qtdNum,
    };

    setItensServico([...itensServico, newItem]);
    setNovoItemDesc('');
    setNovoItemQtd('1');
    setNovoItemValor('');
  };

  const handleRemoveItem = (index: number) => {
    const newList = [...itensServico];
    newList.splice(index, 1);
    setItensServico(newList);
  };

  async function handleSave() {
    if (!form.clienteId || !form.veiculoId) {
      Alert.alert('Atenção', 'Cliente e Veículo são obrigatórios.');
      return;
    }

    setLoading(true);
    try {
      const payloadToSave = { ...form, servicos: itensServico, valorTotal: totalGeral };
      if (isNew) {
        await svcCreate(payloadToSave as any);
        Alert.alert('Sucesso', 'Ordem criada com sucesso!');
      } else {
        await svcUpdate(Number(id), payloadToSave as any);
        Alert.alert('Sucesso', 'Ordem atualizada com sucesso!');
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) => {
    return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Modal states
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurfaceVariant} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{isNew ? 'Nova Ordem de Serviço' : 'Editar Ordem de Serviço'}</Text>
            <Text style={styles.headerSubtitle}>{form.numeroOs || `ID: ${id}`} • Em rascunho</Text>
          </View>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
          style={styles.flex}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
              {initialLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Carregando...</Text>
                </View>
              ) : (
                <>
                  {/* ── Status Grid ── */}
                  <View style={[styles.sectionContainer, isReadOnly && { opacity: 0.6 }]} pointerEvents={isReadOnly ? 'none' : 'auto'}>
                    <Text style={styles.sectionTitle}>STATUS DA ORDEM</Text>
                    <View style={styles.statusGrid}>
                      <StatusGridOption
                        label="Pendente"
                        value="pendente"
                        icon="schedule"
                        currentValue={form.status as StatusOS}
                        activeColor={COLORS.onSurfaceVariant}
                        activeBg={COLORS.surfaceVariant}
                        onSelect={(v) => setForm((s) => ({ ...s, status: v }))}
                        disabled={isReadOnly}
                      />
                      <StatusGridOption
                        label="Andamento"
                        value="em_andamento"
                        icon="build-circle"
                        currentValue={form.status as StatusOS}
                        activeColor={COLORS.warningYellow}
                        activeBg={COLORS.warningYellowBg}
                        onSelect={(v) => setForm((s) => ({ ...s, status: v }))}
                        disabled={isReadOnly}
                      />
                      <StatusGridOption
                        label="Concluída"
                        value="concluida"
                        icon="check-circle"
                        currentValue={form.status as StatusOS}
                        activeColor={COLORS.successGreen}
                        activeBg={COLORS.successGreenBg}
                        onSelect={(v) => setForm((s) => ({ ...s, status: v }))}
                        disabled={isReadOnly}
                      />
                      <StatusGridOption
                        label="Cancelada"
                        value="cancelada"
                        icon="cancel"
                        currentValue={form.status as StatusOS}
                        activeColor={COLORS.statusCancelada}
                        activeBg={'#450A0A'}
                        onSelect={() => setCancelModalVisible(true)}
                        disabled={isReadOnly}
                      />
                    </View>
                  </View>

                  {/* ── Cliente e Veículo Card ── */}
                  <View style={styles.infoCard} pointerEvents={isReadOnly ? 'none' : 'auto'}>
                    <View style={styles.infoHalf}>
                      <View style={styles.infoHeaderRow}>
                        <Text style={styles.infoTitle}>CLIENTE</Text>
                        {!isReadOnly && (
                          <Pressable onPress={() => setClientModalOpen(true)}>
                            <MaterialIcons name="edit" size={16} color={COLORS.primary} />
                          </Pressable>
                        )}
                      </View>
                      {clienteSelecionado ? (
                        <View style={styles.infoContent}>
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{clienteSelecionado.nome.substring(0, 2).toUpperCase()}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.infoName}>{clienteSelecionado.nome}</Text>
                            <Text style={styles.infoSub}>{clienteSelecionado.telefone}</Text>
                          </View>
                        </View>
                      ) : !isReadOnly ? (
                        <Pressable style={styles.emptySelector} onPress={() => setClientModalOpen(true)}>
                          <Text style={styles.emptyText}>Selecionar Cliente</Text>
                        </Pressable>
                      ) : (
                        <Text style={styles.emptyText}>Nenhum cliente</Text>
                      )}
                    </View>

                    <View style={styles.infoDivider} />

                    <View style={styles.infoHalf}>
                      <View style={styles.infoHeaderRow}>
                        <Text style={styles.infoTitle}>VEÍCULO</Text>
                        {!isReadOnly && (
                          <Pressable onPress={() => {
                            if (form.clienteId) setVehicleModalOpen(true);
                            else Alert.alert('Atenção', 'Selecione um cliente primeiro.');
                          }}>
                            <MaterialIcons name="edit" size={16} color={COLORS.primary} />
                          </Pressable>
                        )}
                      </View>
                      {veiculoSelecionado ? (
                        <View style={styles.infoContent}>
                          <View style={styles.vehicleIconWrapper}>
                            <MaterialIcons name="directions-car" size={20} color={COLORS.onSurfaceVariant} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.infoName}>{veiculoSelecionado.marca} {veiculoSelecionado.modelo}</Text>
                            <View style={styles.vehiclePlateBadge}>
                              <Text style={styles.vehiclePlateText}>{veiculoSelecionado.placa}</Text>
                            </View>
                          </View>
                        </View>
                      ) : !isReadOnly ? (
                        <Pressable 
                          style={styles.emptySelector} 
                          onPress={() => {
                            if (form.clienteId) setVehicleModalOpen(true);
                            else Alert.alert('Atenção', 'Selecione um cliente primeiro.');
                          }}
                        >
                          <Text style={styles.emptyText}>Selecionar Veículo</Text>
                        </Pressable>
                      ) : (
                        <Text style={styles.emptyText}>Nenhum veículo</Text>
                      )}
                    </View>
                  </View>

                  <View style={styles.sectionContainer}>
                     <DarkInput
                        label="PROBLEMA RELATADO / OBSERVAÇÕES"
                        placeholder="Descreva o problema relatado pelo cliente..."
                        value={form.descricaoProblema}
                        onChangeText={(t) => setForm((s) => ({ ...s, descricaoProblema: t }))}
                        autoCapitalize="sentences"
                        editable={!isReadOnly}
                     />
                  </View>

                  {form.status === 'cancelada' && form.observacoes ? (
                    <View style={styles.sectionContainer}>
                       <DarkInput
                          label="MOTIVO DO CANCELAMENTO"
                          value={form.observacoes}
                          onChangeText={() => {}}
                          editable={false}
                       />
                    </View>
                  ) : null}

                  {/* ── Itens e Serviços ── */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>ITENS E SERVIÇOS</Text>
                    <View style={styles.cardBox}>
                      {itensServico.map((item, idx) => (
                        <View key={idx} style={styles.itemRow}>
                          <View style={styles.itemAvatarActive}>
                            <MaterialIcons name="check" size={14} color={COLORS.successGreen} />
                          </View>
                          <View style={styles.itemContent}>
                            <Text style={styles.itemDesc}>{item.descricao}</Text>
                            <Text style={styles.itemVal}>{formatCurrency(item.valor || 0)}</Text>
                          </View>
                          {!isReadOnly && (
                            <Pressable onPress={() => handleRemoveItem(idx)} style={styles.itemAction}>
                              <MaterialIcons name="delete-outline" size={20} color={COLORS.error} />
                            </Pressable>
                          )}
                        </View>
                      ))}

                      {/* Add Item Form */}
                      {!isReadOnly && (
                        <View style={styles.addItemForm}>
                          <View style={styles.addItemDescCol}>
                            <TextInput
                              style={styles.addItemInput}
                              placeholder="Descrição..."
                              placeholderTextColor={COLORS.onSecondaryFixedVariant}
                              value={novoItemDesc}
                              onChangeText={setNovoItemDesc}
                            />
                          </View>
                          <View style={styles.addItemQtdCol}>
                            <TextInput
                              style={styles.addItemInputCenter}
                              placeholder="Qtd"
                              placeholderTextColor={COLORS.onSecondaryFixedVariant}
                              keyboardType="numeric"
                              value={novoItemQtd}
                              onChangeText={setNovoItemQtd}
                            />
                          </View>
                          <View style={styles.addItemValCol}>
                            <TextInput
                              style={styles.addItemInput}
                              placeholder="R$ Valor"
                              placeholderTextColor={COLORS.onSecondaryFixedVariant}
                              keyboardType="numeric"
                              value={novoItemValor}
                              onChangeText={setNovoItemValor}
                            />
                          </View>
                          <Pressable style={styles.addBtn} onPress={handleAddItem}>
                            <MaterialIcons name="add" size={20} color={COLORS.onSurface} />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* ── Desconto ── */}
                  <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>CUPOM DE DESCONTO</Text>
                    <View style={styles.discountRow}>
                      <View style={{ flex: 1 }}>
                        <DarkInput
                           value={desconto > 0 ? desconto.toString() : ''}
                           onChangeText={(t) => setDesconto(parseFloat(t) || 0)}
                           placeholder="Valor do desconto R$"
                           keyboardType="numeric"
                           editable={!isReadOnly}
                        />
                      </View>
                    </View>
                  </View>

                  {/* ── Finance Summary ── */}
                  <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Subtotal</Text>
                      <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Desconto</Text>
                      <Text style={styles.summaryValue}>- {formatCurrency(desconto)}</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryTotalLabel}>Valor Total</Text>
                      <Text style={styles.summaryTotalValue}>{formatCurrency(totalGeral)}</Text>
                    </View>
                  </View>

                  {/* ── Actions ── */}
                  <View style={styles.actions}>
                    {!isReadOnly && (
                      <Pressable
                        style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.85 }]}
                        onPress={handleSave}
                        disabled={loading}
                      >
                        <Text style={styles.btnPrimaryText}>{loading ? 'Salvando...' : 'Salvar Ordem de Serviço'}</Text>
                      </Pressable>
                    )}
                    <Pressable
                      style={({ pressed }) => [styles.btnOutline, pressed && { backgroundColor: COLORS.surfaceVariant }]}
                      onPress={() => navigation.goBack()}
                      disabled={loading}
                    >
                      <Text style={styles.btnOutlineText}>{isReadOnly ? 'Voltar' : 'Cancelar'}</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>

        {/* ── Modals ── */}
        <Modal visible={cancelModalVisible} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setCancelModalVisible(false)}>
            <View style={[styles.modalSheet, { paddingBottom: insets.bottom + SPACING.lg }]}>
              <Text style={styles.modalTitle}>Motivo do Cancelamento</Text>
              <DarkInput 
                 placeholder="Digite o motivo..."
                 value={cancelReason}
                 onChangeText={setCancelReason}
              />
              <View style={{ flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.lg }}>
                <Pressable style={[styles.btnPrimary, { flex: 1 }]} onPress={() => {
                  if (!cancelReason.trim()) { Alert.alert('Erro', 'Motivo obrigatório'); return; }
                  setForm(s => ({ ...s, status: 'cancelada', observacoes: cancelReason }));
                  setCancelModalVisible(false);
                }}>
                  <Text style={styles.btnPrimaryText}>Confirmar</Text>
                </Pressable>
                <Pressable style={[styles.btnOutline, { flex: 1 }]} onPress={() => setCancelModalVisible(false)}>
                  <Text style={styles.btnOutlineText}>Voltar</Text>
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Modal>

        <Modal visible={clientModalOpen} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setClientModalOpen(false)}>
            <View style={[styles.modalSheet, { paddingBottom: insets.bottom + SPACING.lg }]}>
              <Text style={styles.modalTitle}>Selecionar Cliente</Text>
              <FlatList
                data={clientes}
                keyExtractor={(c) => c.id.toString()}
                renderItem={({ item }) => (
                  <Pressable
                    style={[styles.modalOption, form.clienteId === item.id && styles.modalOptionActive]}
                    onPress={() => {
                      setForm((s) => ({ ...s, clienteId: item.id, veiculoId: undefined }));
                      setClientModalOpen(false);
                    }}
                  >
                    <Text style={styles.modalOptionName}>{item.nome}</Text>
                  </Pressable>
                )}
              />
            </View>
          </Pressable>
        </Modal>

        <Modal visible={vehicleModalOpen} transparent animationType="slide">
          <Pressable style={styles.modalOverlay} onPress={() => setVehicleModalOpen(false)}>
            <View style={[styles.modalSheet, { paddingBottom: insets.bottom + SPACING.lg }]}>
              <Text style={styles.modalTitle}>Selecionar Veículo</Text>
              {veiculosDoCliente.length > 0 ? (
                <FlatList
                  data={veiculosDoCliente}
                  keyExtractor={(v) => v.id.toString()}
                  renderItem={({ item }) => (
                    <Pressable
                      style={[styles.modalOption, form.veiculoId === item.id && styles.modalOptionActive]}
                      onPress={() => {
                        setForm((s) => ({ ...s, veiculoId: item.id }));
                        setVehicleModalOpen(false);
                      }}
                    >
                      <Text style={styles.modalOptionName}>{item.marca} {item.modelo} - {item.placa}</Text>
                    </Pressable>
                  )}
                />
              ) : (
                <Text style={styles.emptyText}>Cliente não possui veículos.</Text>
              )}
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  safeArea: { flex: 1 },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.margin,
    paddingVertical: SPACING.md,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
    backgroundColor: COLORS.background,
  },
  backBtn: {
    padding: SPACING.xs,
    marginLeft: -SPACING.xs,
    borderRadius: 999,
  },
  headerTitleContainer: { flex: 1 },
  headerTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },

  container: {
    padding: SPACING.margin,
    gap: SPACING.lg,
    paddingBottom: 80,
  },

  loadingContainer: { minHeight: 200, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...TYPOGRAPHY.bodyLg, color: COLORS.onSurfaceVariant },

  sectionContainer: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    ...SHADOWS.level1,
  },
  infoHalf: {
    flex: 1,
    padding: SPACING.md,
  },
  infoDivider: {
    width: 1,
    backgroundColor: COLORS.surfaceVariant,
  },
  infoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  infoTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  infoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  infoName: {
    ...TYPOGRAPHY.bodyMd,
    fontWeight: '600',
    color: COLORS.onSurface,
  },
  infoSub: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  vehicleIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vehiclePlateBadge: {
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  vehiclePlateText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.onSurface,
  },
  emptySelector: {
    paddingVertical: SPACING.xs,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.primary,
    fontStyle: 'italic',
  },

  // Card Box (Lists)
  cardBox: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
    gap: SPACING.md,
  },
  itemAvatarActive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.successGreenBg,
    borderWidth: 1,
    borderColor: COLORS.successGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: { flex: 1 },
  itemDesc: { ...TYPOGRAPHY.bodyLg, color: COLORS.onSurface },
  itemVal: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurfaceVariant, marginTop: 2 },
  itemAction: { padding: SPACING.xs },

  addItemForm: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    gap: SPACING.xs,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  addItemInput: {
    height: 36,
    backgroundColor: COLORS.inputBg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    color: COLORS.onSurface,
    paddingHorizontal: SPACING.sm,
    fontSize: 13,
  },
  addItemInputCenter: {
    height: 36,
    backgroundColor: COLORS.inputBg,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    color: COLORS.onSurface,
    textAlign: 'center',
    fontSize: 13,
  },
  addItemDescCol: { flex: 3 },
  addItemQtdCol: { flex: 1 },
  addItemValCol: { flex: 2 },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },

  discountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.md,
  },

  // Summary
  summaryCard: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    marginTop: SPACING.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  summaryLabel: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurfaceVariant },
  summaryValue: { ...TYPOGRAPHY.bodyMd, color: COLORS.onSurface, fontWeight: '600' },
  summaryDivider: { height: 1, backgroundColor: COLORS.surfaceVariant, marginVertical: SPACING.sm },
  summaryTotalLabel: { ...TYPOGRAPHY.headlineSm, color: COLORS.onSurface },
  summaryTotalValue: { fontSize: 24, fontWeight: '800', color: COLORS.successGreen },

  // Actions
  actions: { gap: SPACING.md, marginTop: SPACING.md },
  btnPrimary: {
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.button,
  },
  btnPrimaryText: { ...TYPOGRAPHY.bodyLg, color: COLORS.onPrimary, fontWeight: '700' },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: { ...TYPOGRAPHY.bodyLg, color: COLORS.onSurface, fontWeight: '600' },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    padding: SPACING.lg,
    maxHeight: '70%',
  },
  modalTitle: { ...TYPOGRAPHY.headlineSm, color: COLORS.onSurface, marginBottom: SPACING.md },
  modalOption: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.surfaceContainer,
  },
  modalOptionActive: { backgroundColor: `${COLORS.primaryContainer}20` },
  modalOptionName: { ...TYPOGRAPHY.bodyLg, color: COLORS.onSurface },
});
