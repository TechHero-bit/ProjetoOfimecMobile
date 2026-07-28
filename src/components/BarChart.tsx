import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { BORDER_RADIUS, COLORS, SPACING, TYPOGRAPHY } from '@/src/theme';

type DataPoint = {
  label: string;
  value: number;
};

type Props = {
  data: DataPoint[];
  height?: number;
};

export default function BarChart({ data, height = 120 }: Props) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={[styles.container, { height }]}>
      {data.map((item, index) => {
        const targetPercentage = (item.value / maxValue) * 100;
        const animatedHeight = useRef(new Animated.Value(0)).current;

        useEffect(() => {
          Animated.timing(animatedHeight, {
            toValue: targetPercentage,
            duration: 800,
            delay: index * 100,
            useNativeDriver: false,
          }).start();
        }, [targetPercentage]);

        const isLast = index === new Date().getDay() - 1 || (new Date().getDay() === 0 && index === 6);
        const isVerySmall = targetPercentage < 25;
        
        const bgColor = isLast 
          ? COLORS.primaryContainer 
          : isVerySmall 
            ? COLORS.surfaceVariant 
            : `${COLORS.primaryContainer}80`;
            
        const textColor = isLast ? COLORS.primary : COLORS.onSurfaceVariant;

        return (
          <View key={index} style={styles.barColumn}>
            <View style={styles.barTrack}>
              <Animated.View 
                style={[
                  styles.barFill, 
                  { 
                    height: animatedHeight.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%']
                    }), 
                    backgroundColor: bgColor 
                  }
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
