import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';
import { AppState, AppStateStatus, Platform } from 'react-native';

onlineManager.setEventListener(setOnline => {
    return NetInfo.addEventListener(state => {
        setOnline(Boolean(state.isConnected));
    });
});

const onAppStateChange = (status: AppStateStatus) => {
    if (Platform.OS !== 'web') {
        focusManager.setFocused(status === 'active');
    }
};

AppState.addEventListener('change', onAppStateChange);

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            staleTime: 30 * 1000,
        },
    },
});
