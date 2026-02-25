import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';

export default function DailyBonusModal() {
    const { lastClaimedDate, setClaimedDate, addGems } = useGameStore();
    const [visible, setVisible] = useState(false);
    const scale = new Animated.Value(0);

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        if (lastClaimedDate !== today) {
            setTimeout(() => {
                setVisible(true);
                Animated.spring(scale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }).start();
            }, 1000);
        }
    }, [lastClaimedDate]);

    const claim = () => {
        const today = new Date().toISOString().split('T')[0];
        addGems(50);
        setClaimedDate(today);
        Animated.timing(scale, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setVisible(false));
    };

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
                    <LinearGradient colors={['#1e1b2e', '#0a0a0f']} style={styles.inner}>
                        <Text style={styles.title}>🎁 DAILY BONUS</Text>
                        <Text style={styles.sub}>Welcome back, Shadow Warrior!</Text>

                        <View style={styles.rewardCircle}>
                            <Text style={styles.rewardText}>💎 50</Text>
                        </View>

                        <TouchableOpacity onPress={claim} activeOpacity={0.8}>
                            <LinearGradient colors={['#7c3aed', '#a855f7']} style={styles.claimBtn}>
                                <Text style={styles.claimText}>CLAIM REWARD</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    card: { width: 300, borderRadius: 24, padding: 4, backgroundColor: '#7c3aed' },
    inner: { borderRadius: 20, padding: 24, alignItems: 'center' },
    title: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 2 },
    sub: { color: '#94a3b8', fontSize: 13, marginTop: 4, marginBottom: 30 },
    rewardCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ffffff10', borderWidth: 2, borderColor: '#818cf8', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
    rewardText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    claimBtn: { paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12 },
    claimText: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
