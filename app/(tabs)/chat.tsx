import { useCallback, useRef } from 'react';
import { View, InteractionManager } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useNavigation, StackActions } from '@react-navigation/native';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export default function ChatTabScreen() {
  const navigation = useNavigation();
  const { colors } = useAppTheme();

  const rootRoutes = navigation.getParent()?.getState()?.routes?.map((r: any) => r.name);
  const initPushed = navigation.getParent()?.getState()?.routes?.some((r: any) => r.name === 'chat') ?? false;

  console.log('[ChatTab] render — rootRoutes:', JSON.stringify(rootRoutes), '| initPushed would be:', initPushed, '| pushed.current will be set on first call');

  // Initialize from actual root stack state — survives hot reloads where
  // useRef(false) would retain the previous session's stale `true` value.
  const pushed = useRef<boolean>(initPushed);

  console.log('[ChatTab] render — pushed.current =', pushed.current);

  useFocusEffect(
    useCallback(() => {
      const rootState = navigation.getParent()?.getState();
      const rootRouteNames = rootState?.routes?.map((r: any) => r.name);
      console.log('[ChatTab] useFocusEffect fired — pushed.current =', pushed.current, '| root routes =', JSON.stringify(rootRouteNames));

      if (!pushed.current) {
        pushed.current = true;
        console.log('[ChatTab] → pushing chat via InteractionManager');
        const task = InteractionManager.runAfterInteractions(() => {
          // router.push('/chat') silently fails because app/(tabs)/chat.tsx and
          // app/chat.tsx both resolve to the same "/chat" path — expo-router
          // treats it as a self-navigation and drops it.
          // Instead, dispatch StackActions.push directly on the ROOT stack
          // navigator (navigation.getParent()), bypassing expo-router's path
          // resolution entirely.
          const rootNav = navigation.getParent();
          console.log('[ChatTab] InteractionManager callback — rootNav:', !!rootNav, '| dispatching StackActions.push("chat")');
          rootNav?.dispatch(StackActions.push('chat'));
        });
        return () => {
          console.log('[ChatTab] useFocusEffect CLEANUP (push branch)');
          task.cancel();
        };
      } else {
        pushed.current = false;
        console.log('[ChatTab] → navigating to index tab via navigation.navigate("index")');
        (navigation as any).navigate('index');
        return () => {
          console.log('[ChatTab] useFocusEffect CLEANUP (navigate-home branch)');
        };
      }
    }, [navigation]),
  );

  return <View style={{ flex: 1, backgroundColor: colors.background }} />;
}
