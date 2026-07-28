import { MaterialIcons } from '@expo/vector-icons';
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

import AppHeader from '@/src/components/AppHeader';
import { listClientes } from '@/src/services/cliente.service';
import {
  createVeiculo as svcCreate,
  deleteVeiculo as svcDelete,
  getVeiculo as svcGet,
  updateVeiculo as svcUpdate,
} from '@/src/services/veiculo.service';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '@/src/theme';
import type { Cliente, Veiculo } from '@/src/types';

// ─── Styled Input ────────────────────────────────────────────
function DarkInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  required,
}: {
  label: string;
  value?: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.label}>
        {label}
        {required ? ' *' : ''}
      </Text>
      <TextInput
        style={[inputStyles.input, focused && inputStyles.inputFocused]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.onSecondaryFixedVariant}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: { gap: SPACING.xs },
  label: { ...TYPOGRAPHY.labelCaps, color: COLORS.onSurfaceVariant },
  input: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
    borderTopLeftRadius: BORDER_RADIUS.default,
    borderTopRightRadius: BORDER_RADIUS.default,
    color: COLORS.onSurface,
    ...TYPOGRAPHY.bodyMd,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },
  inputFocused: {
    borderBottomColor: COLORS.primaryContainer,
  },
});

// ─── Dropdown Select ─────────────────────────────────────────
function DropdownSelect({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onSelect: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label || value;

  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.label}>{label}</Text>
      <Pressable
        style={[inputStyles.input, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}
        onPress={() => setOpen(true)}
      >
        <Text style={{ color: value ? COLORS.onSurface : COLORS.onSecondaryFixedVariant, ...TYPOGRAPHY.bodyMd }}>
          {selectedLabel}
        </Text>
        <MaterialIcons name="arrow-drop-down" size={20} color={COLORS.onSurfaceVariant} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={dropdownStyles.overlay} onPress={() => setOpen(false)}>
          <View style={dropdownStyles.sheet}>
            <Text style={dropdownStyles.sheetTitle}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(i) => i.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[dropdownStyles.option, item.value === value && dropdownStyles.optionActive]}
                  onPress={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[dropdownStyles.optionText, item.value === value && dropdownStyles.optionTextActive]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <MaterialIcons name="check" size={20} color={COLORS.primaryContainer} />
                  )}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const dropdownStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  sheet: {
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    maxHeight: 300,
  },
  sheetTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  optionActive: {
    backgroundColor: `${COLORS.primaryContainer}20`,
  },
  optionText: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
  },
  optionTextActive: {
    color: COLORS.primaryContainer,
    fontWeight: '600',
  },
});

// ─── Main Screen ─────────────────────────────────────────────
const COMBUSTIVEL_OPTIONS = [
  { label: 'Flex', value: 'flex' },
  { label: 'Gasolina', value: 'gasolina' },
  { label: 'Etanol', value: 'etanol' },
  { label: 'Diesel', value: 'diesel' },
];

export default function VeiculoFormScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!isNew);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<Partial<Veiculo>>({
    placa: '',
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    cor: '',
    combustivel: 'flex',
    quilometragem: 0,
    clienteId: undefined,
  });

  useEffect(() => {
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
          navigation.goBack();
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, isNew, navigation]);

  const selectedCliente = clientes.find((c) => c.id === form.clienteId);

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
      navigation.goBack();
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
              navigation.goBack();
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível excluir o veículo.');
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  // Client selection modal
  const [clientModalOpen, setClientModalOpen] = useState(false);

  return (
    <View style={styles.root}>
      <AppHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        style={styles.flex}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            {/* ── Header ── */}
            <View style={styles.header}>
              <Pressable
                style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
                onPress={() => navigation.goBack()}
              >
                <MaterialIcons name="arrow-back" size={24} color={COLORS.onSurfaceVariant} />
              </Pressable>
              <Text style={styles.headerTitle}>{isNew ? 'Novo Veículo' : 'Editar Veículo'}</Text>
            </View>

            {initialLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando...</Text>
              </View>
            ) : (
              <>
                {/* ── Cliente Selecionado Card ── */}
                <View style={styles.clientCard}>
                  <View style={styles.clientIndicator} />
                  <View style={styles.clientCardContent}>
                    <View style={styles.clientCardLeft}>
                      <Text style={styles.clientCardLabel}>CLIENTE SELECIONADO</Text>
                      <View style={styles.clientInfo}>
                        <View style={styles.clientAvatar}>
                          <MaterialIcons name="person" size={24} color={COLORS.onSurfaceVariant} />
                        </View>
                        <View>
                          <Text style={styles.clientName}>
                            {selectedCliente?.nome || 'Selecione um cliente'}
                          </Text>
                          <Text style={styles.clientCpf}>
                            {selectedCliente ? `CPF: ${selectedCliente.cpf}` : 'Toque no ícone para selecionar'}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <Pressable
                      style={({ pressed }) => [styles.swapBtn, pressed && { opacity: 0.7 }]}
                      onPress={() => setClientModalOpen(true)}
                    >
                      <MaterialIcons name="swap-horiz" size={24} color={COLORS.primary} />
                    </Pressable>
                  </View>
                </View>

                {/* ── Identificação do Veículo ── */}
                <View style={styles.formSection}>
                  <View style={styles.formSectionHeader}>
                    <MaterialIcons name="directions-car" size={22} color={COLORS.primary} />
                    <Text style={styles.formSectionTitle}>Identificação do Veículo</Text>
                  </View>

                  <View style={styles.formGrid}>
                    <View style={styles.gridHalf}>
                      <DarkInput
                        label="PLACA"
                        required
                        placeholder="ABC-1234"
                        value={form.placa}
                        onChangeText={(t) => setForm((s) => ({ ...s, placa: t }))}
                        autoCapitalize="characters"
                      />
                    </View>
                    <View style={styles.gridHalf}>
                      <DarkInput
                        label="ANO"
                        required
                        placeholder="2024"
                        value={form.ano?.toString()}
                        onChangeText={(t) => setForm((s) => ({ ...s, ano: parseInt(t) || undefined }))}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.gridHalf}>
                      <DarkInput
                        label="MARCA"
                        required
                        placeholder="Ex: Chevrolet"
                        value={form.marca}
                        onChangeText={(t) => setForm((s) => ({ ...s, marca: t }))}
                        autoCapitalize="words"
                      />
                    </View>
                    <View style={styles.gridHalf}>
                      <DarkInput
                        label="MODELO"
                        required
                        placeholder="Ex: Corolla"
                        value={form.modelo}
                        onChangeText={(t) => setForm((s) => ({ ...s, modelo: t }))}
                        autoCapitalize="words"
                      />
                    </View>
                    <View style={styles.gridHalf}>
                      <DarkInput
                        label="COR"
                        placeholder="Ex: Prata"
                        value={form.cor}
                        onChangeText={(t) => setForm((s) => ({ ...s, cor: t }))}
                      />
                    </View>
                    <View style={styles.gridHalf}>
                      <DropdownSelect
                        label="COMBUSTÍVEL"
                        value={form.combustivel || 'flex'}
                        options={COMBUSTIVEL_OPTIONS}
                        onSelect={(v) => setForm((s) => ({ ...s, combustivel: v }))}
                      />
                    </View>
                    <View style={styles.gridFull}>
                      <DarkInput
                        label="QUILOMETRAGEM (KM)"
                        placeholder="0"
                        value={form.quilometragem?.toString()}
                        onChangeText={(t) => setForm((s) => ({ ...s, quilometragem: parseInt(t) || 0 }))}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>

                {/* ── Botões de Ação ── */}
                <View style={styles.actions}>
                  <Pressable
                    style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.85 }]}
                    onPress={handleSave}
                    disabled={loading}
                  >
                    <Text style={styles.btnPrimaryText}>{loading ? 'Salvando...' : 'Salvar Veículo'}</Text>
                  </Pressable>

                  {!isNew && (
                    <Pressable
                      style={({ pressed }) => [styles.btnDanger, pressed && { opacity: 0.85 }]}
                      onPress={confirmDelete}
                      disabled={loading}
                    >
                      <MaterialIcons name="delete" size={18} color={COLORS.error} />
                      <Text style={styles.btnDangerText}>Excluir Veículo</Text>
                    </Pressable>
                  )}

                  <Pressable
                    style={({ pressed }) => [styles.btnOutline, pressed && { backgroundColor: COLORS.surfaceVariant }]}
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                  >
                    <Text style={styles.btnOutlineText}>Cancelar</Text>
                  </Pressable>
                </View>
              </>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* ── Client Selection Modal ── */}
      <Modal visible={clientModalOpen} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setClientModalOpen(false)}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Selecionar Cliente</Text>
            {clientes.length > 0 ? (
              <FlatList
                data={clientes}
                keyExtractor={(c) => c.id.toString()}
                renderItem={({ item }) => (
                  <Pressable
                    style={[
                      styles.modalOption,
                      form.clienteId === item.id && styles.modalOptionActive,
                    ]}
                    onPress={() => {
                      setForm((s) => ({ ...s, clienteId: item.id }));
                      setClientModalOpen(false);
                    }}
                  >
                    <View style={styles.modalOptionAvatar}>
                      <MaterialIcons name="person" size={20} color={COLORS.onSurfaceVariant} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalOptionName}>{item.nome}</Text>
                      <Text style={styles.modalOptionCpf}>{item.cpf}</Text>
                    </View>
                    {form.clienteId === item.id && (
                      <MaterialIcons name="check-circle" size={22} color={COLORS.primaryContainer} />
                    )}
                  </Pressable>
                )}
              />
            ) : (
              <Text style={styles.emptyText}>Nenhum cliente cadastrado.</Text>
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  container: {
    padding: SPACING.margin,
    gap: SPACING.lg,
    paddingBottom: 120,
  },
  loadingContainer: { minHeight: 200, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...TYPOGRAPHY.bodyLg, color: COLORS.onSurfaceVariant },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  backBtn: {
    padding: SPACING.sm,
    borderRadius: 999,
    backgroundColor: COLORS.surfaceContainerLow,
  },
  backBtnPressed: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
  },

  // Client Card
  clientCard: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    overflow: 'hidden',
    ...SHADOWS.level1,
  },
  clientIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: COLORS.primaryContainer,
  },
  clientCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: SPACING.md,
    paddingLeft: SPACING.md + 4,
  },
  clientCardLeft: {
    flex: 1,
    gap: SPACING.sm,
  },
  clientCardLabel: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurfaceVariant,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  clientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientName: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  clientCpf: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  swapBtn: {
    padding: SPACING.sm,
    borderRadius: 999,
  },

  // Form Section
  formSection: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    padding: SPACING.md,
    ...SHADOWS.level1,
  },
  formSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
    marginBottom: SPACING.md,
  },
  formSectionTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  gridHalf: {
    width: '47%',
    flexGrow: 1,
  },
  gridFull: {
    width: '100%',
  },

  // Action Buttons
  actions: {
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  btnPrimary: {
    backgroundColor: COLORS.primaryContainer,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.button,
  },
  btnPrimaryText: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onPrimary,
    fontWeight: '700',
  },
  btnDanger: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  btnDangerText: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.error,
    fontWeight: '600',
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
    fontWeight: '600',
  },

  // Modal
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
  modalTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
    marginBottom: SPACING.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.md,
    marginBottom: SPACING.xs,
  },
  modalOptionActive: {
    backgroundColor: `${COLORS.primaryContainer}20`,
  },
  modalOptionAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOptionName: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.onSurface,
    fontWeight: '600',
  },
  modalOptionCpf: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  emptyText: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: 'center',
    padding: SPACING.lg,
  },
});
