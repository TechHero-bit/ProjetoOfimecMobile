import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { listVeiculos } from '@/src/services/veiculo.service';
import { COLORS } from '@/src/theme';
import type { Veiculo } from '@/src/types';

export default function VeiculosScreen() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);

  useEffect(() => {
    listVeiculos().then(setVeiculos).catch(() => setVeiculos([]));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Veículos</Text>
      <FlatList
        data={veiculos}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.marca} {item.modelo}</Text>
            <Text style={styles.cardSubtitle}>{item.placa}</Text>
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
});
