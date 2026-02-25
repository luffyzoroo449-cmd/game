import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar } from 'react-native';
import { useGameStore } from '../store/gameStore';

export default function SplashScreen({ navigation }) {
    const logoScale = useRef(new Animated.Value(0.4)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const barWidth = useRef(new Animated.Value(0)).current;
    const loadSave = useGameStore(s => s.loadSave);

    useEffect(() => {
        Animated.parallel([
            Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
            Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]).start();

        Animated.timing(barWidth, { toValue: 1, duration: 2200, useNativeDriver: false }).start();

        const init = async () => {
            await loadSave();
            setTimeout(() => navigation.replace('MainMenu'), 2400);
        };
        init();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar hidden />
            <Animated.View style={{ transform: [{ scale: logoScale }], opacity: logoOpacity, alignItems: 'center' }}>
                <Text style={styles.title}>SHADOW RISE</Text>
                <Text style={styles.subtitle}>The 100 Trials</Text>
            </Animated.View>
            <View style={styles.barBg}>
                <Animated.View style={[styles.barFill, { width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
            </View>
            <Text style={styles.loading}>Loading...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 48, fontWeight: '900', color: '#a855f7', letterSpacing: 6, textShadowColor: '#7c3aed', textShadowRadius: 20 },
    subtitle: { fontSize: 18, color: '#94a3b8', letterSpacing: 4, marginTop: 4 },
    barBg: { marginTop: 48, width: 240, height: 6, backgroundColor: '#1e1e2e', borderRadius: 3, overflow: 'hidden' },
    barFill: { height: 6, backgroundColor: '#a855f7', borderRadius: 3 },
    loading: { marginTop: 12, color: '#475569', fontSize: 13, letterSpacing: 2 },
});
