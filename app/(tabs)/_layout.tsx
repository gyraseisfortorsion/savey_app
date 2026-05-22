import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function TabsLayout() {
  const { colors } = useAppTheme();

  return (
    <NativeTabs
      tintColor={colors.primary}
      minimizeBehavior="automatic"
    >
      <NativeTabs.Trigger
        name="index"
        options={{ title: 'Home', icon: { sf: 'house.fill' } }}
      />
      <NativeTabs.Trigger
        name="chat"
        options={{ title: 'Chat', icon: { sf: 'bubble.left.fill' } }}
      />
      <NativeTabs.Trigger
        name="insights"
        options={{ title: 'Insights', icon: { sf: 'chart.bar.fill' } }}
      />
      <NativeTabs.Trigger
        name="settings"
        options={{ title: 'Settings', icon: { sf: 'gearshape.fill' } }}
      />
    </NativeTabs>
  );
}
