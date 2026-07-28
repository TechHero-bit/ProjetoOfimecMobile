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

import { buscarCep, CepError } from '@/src/services/cep.service';
import {
  createCliente as svcCreate,
  deleteCliente as svcDelete,
  getCliente as svcGet,
  updateCliente as svcUpdate,
} from '@/src/services/cliente.service';
import { BORDER_RADIUS, COLORS, SHADOWS, SPACING, TYPOGRAPHY } from '@/src/theme';
import type { Cliente } from '@/src/types';

// ─── Styled Input ────────────────────────────────────────────
function DarkInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  value?: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.label}>{label}</Text>
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

// ─── Search Input ────────────────────────────────────────────
function SearchInput({
  label,
  value,
  onChangeText,
  placeholder,
  onSearch,
  searching = false,
}: {
  label: string;
  value?: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  onSearch: () => void;
  searching?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.label}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
        <TextInput
          style={[inputStyles.input, { flex: 1 }, focused && inputStyles.inputFocused]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.onSecondaryFixedVariant}
          keyboardType="numeric"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <Pressable
          style={({ pressed }) => [inputStyles.searchBtn, pressed && inputStyles.searchBtnPressed, searching && { opacity: 0.6 }]}
          onPress={onSearch}
          disabled={searching}
        >
          <MaterialIcons name={searching ? 'hourglass-top' : 'search'} size={18} color={COLORS.onSurface} />
          <Text style={inputStyles.searchBtnText}>{searching ? 'BUSCANDO...' : 'BUSCAR'}</Text>
        </Pressable>
      </View>
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
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    height: 48,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
  searchBtnPressed: {
    backgroundColor: COLORS.surfaceBright,
  },
  searchBtnText: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.onSurface,
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
          {selectedLabel || 'UF'}
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
const UF_OPTIONS = [
  { label: 'SP', value: 'SP' },
  { label: 'RJ', value: 'RJ' },
  { label: 'MG', value: 'MG' },
  { label: 'RS', value: 'RS' },
  { label: 'PR', value: 'PR' },
  { label: 'SC', value: 'SC' },
  { label: 'BA', value: 'BA' },
];

export default function ClienteFormScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const isNew = !id || id === 'new';

  const [loading, setLoading] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!isNew);
  const [form, setForm] = useState<Partial<Cliente>>({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
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
          navigation.goBack();
        })
        .finally(() => setInitialLoading(false));
    }
  }, [id, isNew, navigation]);

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
      navigation.goBack();
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Erro ao salvar o cliente');
    } finally {
      setLoading(false);
    }
  }

  async function handleBuscaCep() {
    if (buscandoCep) return;

    setBuscandoCep(true);
    try {
      const endereco = await buscarCep(form.cep ?? '');

      setForm((prev) => ({
        ...prev,
        cep: endereco.cep,
        endereco: endereco.logradouro,
        cidade: endereco.cidade,
        estado: endereco.uf,
      }));
    } catch (err) {
      const message =
        err instanceof CepError
          ? err.message
          : 'Ocorreu um erro inesperado ao buscar o CEP.';
      Alert.alert('Busca de CEP', message);
    } finally {
      setBuscandoCep(false);
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
              navigation.goBack();
            } catch (err) {
              Alert.alert('Erro', 'Não foi possível excluir o cliente. Verifique se ele possui veículos ou ordens de serviço.');
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* ── TopAppBar ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </Pressable>
          <Text style={styles.headerTitle}>OficeMec</Text>
        </View>
        <View style={styles.headerAvatar}>
          <MaterialIcons name="person" size={20} color={COLORS.onSurfaceVariant} />
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        style={styles.flex}
      >
        <View style={styles.flex}>
          <ScrollView 
            contentContainerStyle={styles.container} 
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
              <View style={styles.titleSection}>
                <Text style={styles.screenTitle}>{isNew ? 'Novo Cliente' : 'Editar Cliente'}</Text>
                <Text style={styles.screenSubtitle}>
                  {isNew ? 'Preencha os dados abaixo para cadastrar um novo cliente no sistema.' : `ID: ${id}`}
                </Text>
              </View>

              {initialLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Carregando...</Text>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  {/* ── Informações Pessoais ── */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <MaterialIcons name="badge" size={16} color={COLORS.primary} />
                      <Text style={styles.sectionTitle}>INFORMAÇÕES PESSOAIS</Text>
                    </View>

                    <View style={styles.formGrid}>
                      <View style={styles.gridFull}>
                        <DarkInput
                          label="NOME COMPLETO"
                          placeholder="Ex: João da Silva"
                          value={form.nome}
                          onChangeText={(t) => setForm((s) => ({ ...s, nome: t }))}
                          autoCapitalize="words"
                        />
                      </View>
                      <View style={styles.gridHalf}>
                        <DarkInput
                          label="CPF / CNPJ"
                          placeholder="000.000.000-00"
                          value={form.cpf}
                          onChangeText={(t) => setForm((s) => ({ ...s, cpf: t }))}
                          keyboardType="numeric"
                        />
                      </View>
                      <View style={styles.gridHalf}>
                        <DarkInput
                          label="TELEFONE"
                          placeholder="(00) 00000-0000"
                          value={form.telefone}
                          onChangeText={(t) => setForm((s) => ({ ...s, telefone: t }))}
                          keyboardType="phone-pad"
                        />
                      </View>
                      <View style={styles.gridFull}>
                        <DarkInput
                          label="E-MAIL"
                          placeholder="email@exemplo.com.br"
                          value={form.email}
                          onChangeText={(t) => setForm((s) => ({ ...s, email: t }))}
                          keyboardType="email-address"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>
                  </View>

                  {/* ── Endereço ── */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                      <MaterialIcons name="pin-drop" size={16} color={COLORS.primary} />
                      <Text style={styles.sectionTitle}>ENDEREÇO</Text>
                    </View>

                    <View style={styles.formGrid}>
                      <View style={styles.gridFull}>
                        <SearchInput
                          label="CEP"
                          placeholder="00000-000"
                          value={form.cep}
                          onChangeText={(t) => setForm((s) => ({ ...s, cep: t }))}
                          onSearch={handleBuscaCep}
                          searching={buscandoCep}
                        />
                      </View>
                      <View style={styles.gridFull}>
                        <DarkInput
                          label="LOGRADOURO"
                          placeholder="Rua, Avenida, etc..."
                          value={form.endereco}
                          onChangeText={(t) => setForm((s) => ({ ...s, endereco: t }))}
                          autoCapitalize="sentences"
                        />
                      </View>
                      <View style={[styles.gridHalf, { flexGrow: 2 }]}>
                        <DarkInput
                          label="CIDADE"
                          placeholder="Cidade"
                          value={form.cidade}
                          onChangeText={(t) => setForm((s) => ({ ...s, cidade: t }))}
                          autoCapitalize="words"
                        />
                      </View>
                      <View style={[styles.gridHalf, { flexGrow: 1 }]}>
                        <DropdownSelect
                          label="UF"
                          value={form.estado || ''}
                          options={UF_OPTIONS}
                          onSelect={(v) => setForm((s) => ({ ...s, estado: v }))}
                        />
                      </View>
                    </View>
                  </View>
                  
                  {!isNew && (
                    <View style={{ marginTop: SPACING.md }}>
                      <Pressable
                        style={({ pressed }) => [styles.btnDangerOutline, pressed && { backgroundColor: COLORS.surfaceVariant }]}
                        onPress={confirmDelete}
                        disabled={loading}
                      >
                        <MaterialIcons name="delete" size={20} color={COLORS.error} />
                        <Text style={styles.btnDangerOutlineText}>Excluir Cliente</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* ── Barra de Ação Fixa ── */}
            <View style={styles.bottomBar}>
              <Pressable
                style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.85 }]}
                onPress={handleSave}
                disabled={loading}
              >
                <MaterialIcons name="save" size={20} color={COLORS.white} />
                <Text style={styles.saveBtnText}>{loading ? 'SALVANDO...' : 'SALVAR'}</Text>
              </Pressable>
            </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.margin,
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceVariant,
    backgroundColor: COLORS.surface,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  backBtn: {
    padding: SPACING.xs,
    marginLeft: -SPACING.xs,
    borderRadius: 999,
  },
  backBtnPressed: {
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  headerTitle: {
    ...TYPOGRAPHY.headlineMd,
    color: COLORS.primary,
  },
  headerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Main Content
  container: {
    padding: SPACING.margin,
    paddingTop: 84, // Extra top padding to match design
    paddingBottom: 100, // Room for bottom bar
  },
  titleSection: {
    marginBottom: SPACING.lg,
  },
  screenTitle: {
    ...TYPOGRAPHY.headlineSm,
    color: COLORS.onSurface,
  },
  screenSubtitle: {
    ...TYPOGRAPHY.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },

  loadingContainer: { minHeight: 200, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...TYPOGRAPHY.bodyLg, color: COLORS.onSurfaceVariant },

  formContainer: {
    gap: SPACING.lg,
  },
  sectionCard: {
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceVariant,
    padding: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.labelCaps,
    color: COLORS.primary,
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

  btnDangerOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.default,
    borderWidth: 1,
    borderColor: COLORS.error,
  },
  btnDangerOutlineText: {
    ...TYPOGRAPHY.bodyLg,
    color: COLORS.error,
    fontWeight: '600',
  },

  // Bottom Fixed Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surfaceContainer,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
    padding: SPACING.margin,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.margin,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primaryContainer,
    height: 48,
    borderRadius: BORDER_RADIUS.default,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
