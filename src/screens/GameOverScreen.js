import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GameOverScreen({ route, navigation }) {
    const { levelId = 1 } = route.params ?? {};
    const shake = useRef(new Animated.Value(0)).current;
    const fade = useRef(new Animated.Value(0)).current;

    const [adLoading, setAdLoading] = React.useState(false);
    const [reviveTimer, setReviveTimer] = React.useState(5);

    useEffect(() => {
        Animated.sequence([
            Animated.timing(shake, { toValue: 10, duration: 80, useNativeDriver: true }),
            Animated.timing(shake, { toValue: -10, duration: 80, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 6, duration: 60, useNativeDriver: true }),
            Animated.timing(shake, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
        Animated.timing(fade, { toValue: 1, duration: 600, useNativeDriver: true }).start();

        const timer = setInterval(() => {
            setReviveTimer(t => {
                if (t <= 1) { clearInterval(timer); return 0; }
                return t - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const showAd = () => {
        setAdLoading(true);
        setTimeout(() => {
            setAdLoading(false);
            navigation.replace('Game', { levelId, revive: true });
        }, 3000);
    };

    return (
        <LinearGradient colors={['#1a0000', '#0a0a0f', '#1a0000']} style={styles.container}>
            <Animated.View style={{ opacity: fade, alignItems: 'center' }}>
                <Animated.Text style={[styles.title, { transform: [{ translateX: shake }] }]}>💀 GAME OVER</Animated.Text>
                <Text style={styles.sub}>You fell in level {levelId}</Text>

                {reviveTimer > 0 && !adLoading && (
                    <Text style={styles.clockIcon}>⏳ <Text style={styles.reviveText}>{reviveTimer}s</Text></Text>
                )}

                <View style={styles.btnGroup}>
                    <TouchableOpacity onPress={() => navigation.replace('Game', { levelId })} activeOpacity={0.85}>
                        <LinearGradient colors={['#7c3aed', '#a855f7']} style={styles.btn}>
                            <Text style={styles.btnText}>↺  Try Again</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {reviveTimer > 0 && (
                        <TouchableOpacity style={[styles.btn, styles.adBtn]} activeOpacity={0.85} onPress={showAd}>
                            <Text style={styles.adBtnText}>📺  Watch Ad to Revive</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={() => navigation.replace('WorldMap')}>
                        <Text style={[styles.btnText, { color: '#94a3b8' }]}>🗺  World Map</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.btn, styles.secondaryBtn]} onPress={() => navigation.replace('MainMenu')}>
                        <Text style={[styles.btnText, { color: '#94a3b8' }]}>⌂  Main Menu</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {adLoading && (
                <View style={styles.adOverlay}>
                    <Text style={styles.adTitle}>ADVERTISING</Text>
                    <View style={styles.adLoader} />
                    <Text style={styles.adSub}>Reviving in 3s...</Text>
                </View>
            )}
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 44, color: '#ef4444', fontWeight: '900', letterSpacing: 4, textShadowColor: '#dc262688', textShadowRadius: 20 },
    sub: { color: '#64748b', fontSize: 16, marginTop: 8, marginBottom: 24, letterSpacing: 1 },
    reviveText: { color: '#f59e0b', fontSize: 20, fontWeight: '800' },
    clockIcon: { marginBottom: 20 },
    btnGroup: { gap: 14, width: 260 },
    btn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    secondaryBtn: { backgroundColor: '#1e1b2e' },
    adBtn: { backgroundColor: '#064e3b', borderWidth: 2, borderColor: '#10b981' },
    btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 1 },
    adBtnText: { color: '#34d399', fontSize: 15, fontWeight: '800' },
    adOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
    adTitle: { color: '#64748b', fontSize: 12, letterSpacing: 3, marginBottom: 40 },
    adLoader: { width: 60, height: 60, borderRadius: 30, borderWidth: 4, borderColor: '#34d399', borderTopColor: 'transparent' },
    adSub: { color: '#fff', marginTop: 20, fontSize: 16, fontWeight: '600' },
});
