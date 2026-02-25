import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { SKINS } from '../game/constants/GameConstants';

export default function ShopScreen({ navigation }) {
    const { gems, ownedSkins, activeSkin, setActiveSkin, buySkin, isPremium, unlockPremium } = useGameStore();
    const [selected, setSelected] = useState(activeSkin);

    const handleBuy = (skin) => {
        if (skin.premiumOnly && !isPremium) {
            Alert.alert('Premium Only', 'Unlock Premium to get this skin!');
            return;
        }
        if (ownedSkins.includes(skin.id)) {
            setActiveSkin(skin.id);
            setSelected(skin.id);
            return;
        }
        if (gems < skin.cost) {
            Alert.alert('Not enough Gems', `You need ${skin.cost} 💎 but have ${gems}.`);
            return;
        }
        Alert.alert('Buy Skin?', `Purchase "${skin.name}" for ${skin.cost} 💎?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Buy', onPress: () => { const ok = buySkin(skin.id); if (ok) { setActiveSkin(skin.id); setSelected(skin.id); } } },
        ]);
    };

    return (
        <LinearGradient colors={['#0a0a0f', '#120a2a', '#0a0a0f']} style={styles.container}>
            <Text style={styles.header}>🛒 Skin Shop</Text>
            <View style={styles.gemRow}>
                <Text style={styles.gemCount}>💎 {gems} Gems</Text>
            </View>

            <ScrollView contentContainerStyle={styles.grid}>
                {SKINS.map((skin) => {
                    const owned = ownedSkins.includes(skin.id);
                    const active = activeSkin === skin.id;
                    return (
                        <TouchableOpacity key={skin.id} onPress={() => handleBuy(skin)} activeOpacity={0.85}>
                            <LinearGradient
                                colors={active ? [skin.color + 'aa', skin.color + '44'] : ['#1e1b2e', '#12102a']}
                                style={[styles.card, active && { borderColor: skin.color, borderWidth: 2 }]}
                            >
                                {/* Skin preview */}
                                <View style={[styles.preview, { backgroundColor: skin.color }]}>
                                    <View style={styles.previewEye} />
                                </View>
                                <Text style={styles.skinName}>{skin.name}</Text>
                                {skin.premiumOnly
                                    ? <Text style={styles.premiumTag}>👑 PREMIUM</Text>
                                    : owned
                                        ? <Text style={[styles.price, { color: active ? '#4ade80' : '#94a3b8' }]}>{active ? '✔ Equipped' : 'Equip'}</Text>
                                        : <Text style={styles.price}>💎 {skin.cost}</Text>
                                }
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {!isPremium && (
                <TouchableOpacity style={styles.premiumBtn} onPress={() => {
                    Alert.alert('Unlock Premium', 'Remove all ads + Void Emperor Skin?', [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Unlock', onPress: unlockPremium },
                    ]);
                }}>
                    <LinearGradient colors={['#7c3aed', '#a855f7']} style={styles.premiumBtnInner}>
                        <Text style={styles.premiumBtnText}>👑 Unlock Premium</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 48 },
    header: { color: '#e2e8f0', fontSize: 24, fontWeight: '900', textAlign: 'center', letterSpacing: 3 },
    gemRow: { alignItems: 'center', marginTop: 8, marginBottom: 16 },
    gemCount: { color: '#818cf8', fontSize: 18, fontWeight: '700' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, paddingBottom: 120, paddingHorizontal: 16 },
    card: { width: 110, borderRadius: 16, padding: 14, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#334155' },
    preview: { width: 48, height: 64, borderRadius: 8, justifyContent: 'flex-start', alignItems: 'flex-end', padding: 4 },
    previewEye: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#fff' },
    skinName: { color: '#e2e8f0', fontSize: 12, fontWeight: '700', textAlign: 'center' },
    price: { color: '#818cf8', fontSize: 13, fontWeight: '700' },
    premiumTag: { color: '#fbbf24', fontSize: 11, fontWeight: '700' },
    premiumBtn: { position: 'absolute', bottom: 56, left: 20, right: 20 },
    premiumBtnInner: { borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
    premiumBtnText: { color: '#fff', fontSize: 17, fontWeight: '900', letterSpacing: 2 },
    backBtn: { position: 'absolute', bottom: 16, left: 20 },
    backText: { color: '#94a3b8', fontSize: 16 },
});
