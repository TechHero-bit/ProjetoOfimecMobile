import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { listOrdensServico } from '@/src/services/ordem-servico.service';
import { COLORS } from '@/src/theme';
import type { OrdemServico } from '@/src/types';

export default function OrdensScreen() {
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);

  useEffect(() => {
    listOrdensServico().then(setOrdens).catch(() => setOrdens([]));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ordens de Serviço</Text>
      <FlatList
        data={ordens}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>OS #{item.id}</Text>
            <Text style={styles.cardSubtitle}>{item.descricaoProblema}</Text>
            <Text style={styles.status}>{item.status}</Text>
          </View>
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
  status: { marginTop: 8, color: COLORS.primary, fontWeight: '600' },
});
