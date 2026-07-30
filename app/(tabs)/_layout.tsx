import { Ionicons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, SPACING } from '@/src/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.onSecondaryFixedVariant,
        tabBarStyle: {
          backgroundColor: COLORS.surfaceContainer,
          borderTopWidth: 1,
          borderTopColor: COLORS.surfaceVariant,
          paddingTop: SPACING.sm,
          paddingBottom: insets.bottom + SPACING.sm,
          paddingHorizontal: SPACING.md,
          height: insets.bottom + 64,
          elevation: 2,
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
        },
        tabBarItemStyle: {
          marginVertical: SPACING.xs,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: SPACING.xs,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ordens"
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            router.replace('/(tabs)/ordens');
          },
        }}
        options={{
          title: 'Ordens',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "document-text" : "document-text-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="clientes"
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            router.replace('/(tabs)/clientes');
          },
        }}
        options={{
          title: 'Clientes',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="veiculos"
        listeners={{
          tabPress: (event) => {
            event.preventDefault();
            router.replace('/(tabs)/veiculos');
          },
        }}
        options={{
          title: 'Veículos',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "car-sport" : "car-sport-outline"} size={size} color={color} />
          ),
        }}
      />

      {/* Rotas ocultas da tab bar — acessíveis via navegação programática */}
      <Tabs.Screen
        name="perfil"
        options={{ href: null }}
      />
    </Tabs>
  );
}
