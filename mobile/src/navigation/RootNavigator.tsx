import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useAuth } from '../hooks/useAuth';
import { AuthStackParamList, MainStackParamList, RootTabParamList } from '../types/navigation';
import { colors } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BooksListScreen from '../screens/BooksListScreen';
import BookDetailScreen from '../screens/BookDetailScreen';
import ScanScreen from '../screens/ScanScreen';
import WordConfirmScreen from '../screens/WordConfirmScreen';
import ReviewSessionScreen from '../screens/ReviewSessionScreen';
import BookShareScreen from '../screens/BookShareScreen';

const navigationTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: colors.primary,
        background: colors.background,
        card: colors.background,
        text: colors.textMain,
        border: colors.border,
    },
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const RootTab = createBottomTabNavigator<RootTabParamList>();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
    return (
        <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive]}>
            <Text style={styles.tabIcon}>{emoji}</Text>
        </View>
    );
}

function BooksTabIcon({ focused }: { focused: boolean }) {
    return <TabIcon emoji="📚" focused={focused} />;
}

function ProfileTabIcon({ focused }: { focused: boolean }) {
    return <TabIcon emoji="👤" focused={focused} />;
}

function AuthNavigator() {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            <AuthStack.Screen name="Signup" component={SignupScreen} />
        </AuthStack.Navigator>
    );
}

function BooksNavigator() {
    return (
        <MainStack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.primary,
                headerTitleStyle: { color: colors.textMain, fontWeight: '700' },
                headerShadowVisible: false,
            }}
        >
            <MainStack.Screen name="BooksList" component={BooksListScreen} options={{ title: '내 단어장' }} />
            <MainStack.Screen
                name="BookDetail"
                component={BookDetailScreen}
                options={({ route }) => ({ title: route.params.bookName })}
            />
            <MainStack.Screen name="Scan" component={ScanScreen} options={{ title: '단어 촬영' }} />
            <MainStack.Screen name="WordConfirm" component={WordConfirmScreen} options={{ title: '단어 저장' }} />
            <MainStack.Screen
                name="Review"
                component={ReviewSessionScreen}
                options={({ route }) => ({ title: `${route.params.bookName} 복습` })}
            />
            <MainStack.Screen name="BookShare" component={BookShareScreen} options={{ title: '단어장 공유' }} />
        </MainStack.Navigator>
    );
}

const tabScreenOptions: BottomTabNavigationOptions = {
    headerShown: false,
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textDisabled,
    tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
    tabBarStyle: { borderTopColor: colors.border, height: 60, paddingTop: 6, paddingBottom: 6 },
};

function MainNavigator() {
    return (
        <RootTab.Navigator screenOptions={tabScreenOptions}>
            <RootTab.Screen
                name="BooksTab"
                component={BooksNavigator}
                options={{ title: '단어장', tabBarIcon: BooksTabIcon }}
            />
            <RootTab.Screen
                name="ProfileTab"
                component={ProfileScreen}
                options={{ title: '내 정보', tabBarIcon: ProfileTabIcon }}
            />
        </RootTab.Navigator>
    );
}

export default function RootNavigator() {
    const { member, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer theme={navigationTheme}>
            {member ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    tabIcon: { fontSize: 16 },
    tabIconWrap: {
        width: 34,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIconWrapActive: { backgroundColor: colors.primaryLight },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
});
