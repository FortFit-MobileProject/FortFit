import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './src/navigation/autenticacao';

export default function App() {
    return (
        <NavigationContainer>
            <AuthStack />
            <StatusBar style="light" />
        </NavigationContainer>
    );
}