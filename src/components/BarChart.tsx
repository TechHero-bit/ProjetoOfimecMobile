import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';
import { StyleSheet, Text, View } from 'react-native';

type DataPoint = {
  label: string;
  value: number;
};

type Props = {
  data: DataPoint[];
  height?: number;
};

export default function BarChart({ data, height = 120 }: Props) {
  // Find max value to scale the bars
  const maxValue = Math.max(...data.map(d => d.value), 1); // Avoid division by zero

  return (
    <View style={[styles.container, { height }]}>
      {data.map((item, index) => {
        const barHeightPercentage = (item.value / maxValue) * 100;
        
        // Use primaryContainer for most, except maybe a specific item or pattern.
        // In the design, the last full bar is primaryContainer, earlier ones have lower opacity or use variant.
        // Let's create a visual effect similar to the mockup.
        const isLast = index === data.length - 2; // Actually the 'S' is max, the last 'S' is very small
        const isVerySmall = barHeightPercentage < 25;
        
        const bgColor = isLast 
          ? COLORS.primaryContainer 
          : isVerySmall 
            ? COLORS.surfaceVariant 
            : `${COLORS.primaryContainer}80`; // 50% opacity
            
        const textColor = isLast ? COLORS.primary : COLORS.onSurfaceVariant;

        return (
          <View key={index} style={styles.barColumn}>
            <View style={styles.barTrack}>
              <View 
                style={[
                  styles.barFill, 
                  { height: `${barHeightPercentage}%`, backgroundColor: bgColor }
                ]} 
              />
            </View>
            <Text style={[styles.label, { color: textColor }]}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    paddingTop: SPACING.md,
    gap: 8,
  },
  barColumn: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  barTrack: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: BORDER_RADIUS.sm,
    borderTopRightRadius: BORDER_RADIUS.sm,
  },
  label: {
    ...TYPOGRAPHY.labelCaps,
    fontSize: 10,
  },
});
