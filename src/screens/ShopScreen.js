import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { SKINS } from '../game/constants/GameConstants';

const GEM_PACKS = [
    { id: 'gem_small', name: 'Handful of Gems', amount: 100, price: '$0.99' },
    { id: 'gem_medium', name: 'Bag of Gems', amount: 500, price: '$3.99' },
    { id: 'gem_large', name: 'Chest of Gems', amount: 1500, price: '$9.99' },
];

export default function ShopScreen({ navigation }) {
    const { gems, ownedSkins, activeSkin, setActiveSkin, buySkin, isPremium, unlockPremium, addGems } = useGameStore();
    const [tab, setTab] = useState('skins');

    const handleBuy = (skin) => {
        if (skin.premiumOnly && !isPremium) {
            Alert.alert('Premium Only', 'Unlock Premium to get this skin!');
            return;
        }
        if (ownedSkins.includes(skin.id)) {
            setActiveSkin(skin.id);
            return;
        }
        if (gems < skin.cost) {
            Alert.alert('Not enough Gems', `You need ${skin.cost} 💎 but have ${gems}.`);
            return;
        }
        Alert.alert('Buy Skin?', `Purchase "${skin.name}" for ${skin.cost} 💎?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Buy', onPress: () => { const ok = buySkin(skin.id); if (ok) { setActiveSkin(skin.id); } } },
        ]);
    };

    const handleBuyGems = (pack) => {
        Alert.alert('In-App Purchase', `Buy ${pack.name} for ${pack.price}? (Simulation)`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Buy', onPress: () => addGems(pack.amount) },
        ]);
    };

    return (
        <LinearGradient colors={['#0a0a0f', '#120a2a', '#0a0a0f']} style={styles.container}>
            <Text style={styles.header}>🛒 Skin Shop</Text>
            <View style={styles.gemRow}>
                <Text style={styles.gemCount}>💎 {gems} Gems</Text>
            </View>

            <View style={styles.tabBar}>
                <TouchableOpacity style={[styles.tab, tab === 'skins' && styles.tabActive]} onPress={() => setTab('skins')}>
                    <Text style={[styles.tabText, tab === 'skins' && styles.tabTextActive]}>Skins</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.tab, tab === 'gems' && styles.tabActive]} onPress={() => setTab('gems')}>
                    <Text style={[styles.tabText, tab === 'gems' && styles.tabTextActive]}>Gems</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.grid}>
                {tab === 'skins' ? SKINS.map((skin) => {
                    const owned = ownedSkins.includes(skin.id);
                    const active = activeSkin === skin.id;
                    return (
                        <TouchableOpacity key={skin.id} onPress={() => handleBuy(skin)} activeOpacity={0.85}>
                            <LinearGradient
                                colors={active ? [skin.color + 'aa', skin.color + '44'] : ['#1e1b2e', '#12102a']}
                                style={[styles.card, active && { borderColor: skin.color, borderWidth: 2 }]}
                            >
                                <View style={[styles.preview, { backgroundColor: skin.color }]}>
                                    <View style={styles.previewEye} />
                                </View>
                                <Text style={styles.skinName}>{skin.name}</Text>
                                <Text style={styles.price}>{skin.premiumOnly && !isPremium ? '👑 PREMIUM' : owned ? (active ? 'Equipped' : 'Owned') : `💎 ${skin.cost}`}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                }) : GEM_PACKS.map((pack) => (
                    <TouchableOpacity key={pack.id} onPress={() => handleBuyGems(pack)} activeOpacity={0.85}>
                        <LinearGradient colors={['#1e1b2e', '#1e293b']} style={styles.card}>
                            <Text style={styles.packIcon}>💎</Text>
                            <Text style={styles.packAmt}>{pack.amount}</Text>
                            <Text style={styles.skinName}>{pack.name}</Text>
                            <View style={styles.priceBtn}><Text style={styles.priceBtnText}>{pack.price}</Text></View>
                        </LinearGradient>
                    </TouchableOpacity>
                ))}
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
    gemRow: { alignItems: 'center', marginTop: 8, marginBottom: 12 },
    gemCount: { color: '#818cf8', fontSize: 18, fontWeight: '700' },
    tabBar: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, gap: 10 },
    tab: { paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20, backgroundColor: '#ffffff10' },
    tabActive: { backgroundColor: '#7c3aed' },
    tabText: { color: '#94a3b8', fontWeight: 'bold' },
    tabTextActive: { color: '#fff' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, paddingBottom: 120, paddingHorizontal: 16 },
    card: { width: 110, borderRadius: 16, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#334155' },
    preview: { width: 44, height: 56, borderRadius: 8, justifyContent: 'flex-start', alignItems: 'flex-end', padding: 4 },
    previewEye: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
    skinName: { color: '#e2e8f0', fontSize: 11, fontWeight: '700', textAlign: 'center' },
    price: { color: '#818cf8', fontSize: 12, fontWeight: '700' },
    packIcon: { fontSize: 24 },
    packAmt: { color: '#fff', fontSize: 20, fontWeight: '900' },
    priceBtn: { backgroundColor: '#34d399', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginTop: 4 },
    priceBtnText: { color: '#064e3b', fontSize: 11, fontWeight: '900' },
    premiumBtn: { position: 'absolute', bottom: 56, left: 20, right: 20 },
    premiumBtnInner: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
    premiumBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
    backBtn: { position: 'absolute', bottom: 16, left: 20 },
    backText: { color: '#94a3b8', fontSize: 16 },
});
