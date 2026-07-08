import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { listClientes } from '@/src/services/cliente.service';
import { COLORS } from '@/src/theme';
import type { Cliente } from '@/src/types';

export default function ClientesScreen() {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    listClientes().then(setClientes).catch(() => setClientes([]));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clientes</Text>
      <FlatList
        data={clientes}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable style={styles.card}>
            <Text style={styles.cardTitle}>{item.nome}</Text>
            <Text style={styles.cardSubtitle}>{item.telefone}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.primary, marginBottom: 12 },
  list: { gap: 12 },
  card: { backgroundColor: COLORS.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  cardSubtitle: { color: COLORS.textSecondary, marginTop: 4 },
});
