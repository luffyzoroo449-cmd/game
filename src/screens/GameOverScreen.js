import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GameOverScreen({ route, navigation }) {
    const { levelId = 1 } = route.params ?? {};
    const shake = useRef(new Animated.Value(0)).current;
    const fade = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.timing(shake, { toValue: 10, duration: 80, useNativeDriver: true }),
            Animated.timing(shake, { toValue: -10, duration: 80, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
        Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    }, []);

    return (
        <LinearGradient colors={['#1a0000', '#0a0a0f', '#1a0000']} style={styles.container}>
            <Animated.View style={{ opacity: fade, alignItems: 'center' }}>
                <Animated.Text style={[styles.title, { transform: [{ translateX: shake }] }]}>💀 GAME OVER</Animated.Text>
                <Text style={styles.sub}>You fell in level {levelId}</Text>

                <View style={styles.btnGroup}>
                    <TouchableOpacity onPress={() => navigation.replace('Game', { levelId })} activeOpacity={0.85}>
                        <LinearGradient colors={['#7c3aed', '#a855f7']} style={styles.btn}>
                            <Text style={styles.btnText}>↺  Try Again</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Rewarded ad hook placeholder */}
                    <TouchableOpacity style={[styles.btn, styles.adBtn]} activeOpacity={0.85}
                        onPress={() => {
                            // TODO: show rewarded ad -> on reward give extra life
                            navigation.replace('Game', { levelId });
                        }}>
                        <Text style={styles.adBtnText}>📺  Watch Ad for Extra Life</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={() => navigation.replace('WorldMap')}>
                        <Text style={[styles.btnText, { color: '#94a3b8' }]}>🗺  World Map</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={() => navigation.replace('MainMenu')}>
                        <Text style={[styles.btnText, { color: '#94a3b8' }]}>⌂  Main Menu</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 44, color: '#ef4444', fontWeight: '900', letterSpacing: 4, textShadowColor: '#dc262688', textShadowRadius: 20 },
    sub: { color: '#64748b', fontSize: 16, marginTop: 8, marginBottom: 36, letterSpacing: 1 },
    btnGroup: { gap: 14, width: 260 },
    btn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
    secondaryBtn: { backgroundColor: '#1e1b2e' },
    adBtn: { backgroundColor: '#1e3a2e', borderWidth: 1, borderColor: '#22c55e' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
    adBtnText: { color: '#4ade80', fontSize: 15, fontWeight: '700' },
});
