import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { useAudio } from '../hooks/useAudio';
import DailyBonusModal from '../components/DailyBonusModal';

export default function MainMenuScreen({ navigation }) {
    const { rank, totalXP, coins, gems } = useGameStore();
    const { playBGM } = useAudio();
    const pulse = useRef(new Animated.Value(1)).current;
    const fadeIn = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        playBGM('menu_theme');
        Animated.timing(fadeIn, { toValue: 1, duration: 800, useNativeDriver: true }).start();
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, { toValue: 1.06, duration: 900, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    const buttons = [
        { label: '▶  PLAY', action: () => navigation.navigate('WorldMap'), primary: true },
        { label: '🎯  MISSIONS', action: () => navigation.navigate('Missions') },
        { label: '🛒  SHOP', action: () => navigation.navigate('Shop') },
        { label: '⚙️  SETTINGS', action: () => navigation.navigate('Settings') },
    ];

    return (
        <LinearGradient colors={['#0a0a0f', '#12053a', '#0a0a0f']} style={styles.container}>
            <StatusBar hidden />
            <Animated.View style={{ opacity: fadeIn, alignItems: 'center' }}>
                {/* Title */}
                <Animated.Text style={[styles.title, { transform: [{ scale: pulse }] }]}>SHADOW RISE</Animated.Text>
                <Text style={styles.subtitle}>The 100 Trials</Text>

                {/* Stats bar */}
                <View style={styles.statsRow}>
                    <View style={styles.statBadge}><Text style={styles.statIcon}>🪙</Text><Text style={styles.statVal}>{coins}</Text></View>
                    <View style={styles.statBadge}><Text style={styles.statIcon}>💎</Text><Text style={styles.statVal}>{gems}</Text></View>
                    <View style={[styles.statBadge, styles.rankBadge]}><Text style={styles.rankText}>{rank}</Text></View>
                </View>

                {/* Buttons */}
                <View style={styles.btnGroup}>
                    {buttons.map((b, i) => (
                        <TouchableOpacity key={i} onPress={b.action} activeOpacity={0.8}>
                            <LinearGradient
                                colors={b.primary ? ['#7c3aed', '#a855f7'] : ['#1e1b2e', '#2d2a42']}
                                style={[styles.btn, b.primary && styles.btnPrimary]}
                            >
                                <Text style={[styles.btnText, b.primary && styles.btnTextPrimary]}>{b.label}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>
                <Text style={styles.version}>v1.0.0  •  Shadow Rise Studios</Text>
            </Animated.View>
            <DailyBonusModal />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 52, fontWeight: '900', color: '#a855f7', letterSpacing: 6, textShadowColor: '#7c3aed88', textShadowRadius: 24 },
    subtitle: { fontSize: 16, color: '#94a3b8', letterSpacing: 5, marginBottom: 32 },
    statsRow: { flexDirection: 'row', gap: 12, marginBottom: 36 },
    statBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e1b2e', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, gap: 6 },
    statIcon: { fontSize: 16 },
    statVal: { color: '#e2e8f0', fontWeight: '700', fontSize: 15 },
    rankBadge: { backgroundColor: '#4c1d95' },
    rankText: { color: '#c4b5fd', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
    btnGroup: { gap: 14, width: 240 },
    btn: { borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
    btnPrimary: { shadowColor: '#a855f7', shadowOpacity: 0.6, shadowRadius: 12, elevation: 8 },
    btnText: { fontSize: 16, color: '#94a3b8', fontWeight: '700', letterSpacing: 2 },
    btnTextPrimary: { color: '#fff' },
    version: { marginTop: 40, color: '#334155', fontSize: 11, letterSpacing: 1 },
});
