import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';
import { WORLDS, WORLD_COLORS } from '../game/constants/WorldConfig';
import { getLevelsForWorld } from '../game/levels';

const STARS = ['☆☆☆', '★☆☆', '★★☆', '★★★'];

export default function WorldMapScreen({ navigation }) {
    const { levelProgress, setActiveLevel } = useGameStore();
    const [selectedWorld, setSelectedWorld] = useState(1);
    const wc = WORLD_COLORS[WORLDS[selectedWorld].name] ?? { primary: '#7c3aed', secondary: '#a855f7', bg: '#0a0a0f' };
    const levels = getLevelsForWorld(selectedWorld);

    const isUnlocked = (levelId) => {
        if (levelId === 1) return true;
        return levelProgress[levelId]?.unlocked ?? false;
    };

    return (
        <LinearGradient colors={[wc.bg, '#0a0a0f']} style={styles.container}>
            <StatusBar hidden />
            <Text style={styles.header}>🗺 World Select</Text>

            {/* World tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.worldTabs} contentContainerStyle={{ gap: 10, paddingHorizontal: 16 }}>
                {Object.values(WORLDS).map((w) => {
                    const worldColor = WORLD_COLORS[w.name]?.primary ?? '#7c3aed';
                    const active = selectedWorld === w.id;
                    return (
                        <TouchableOpacity key={w.id} onPress={() => setSelectedWorld(w.id)} activeOpacity={0.8}>
                            <View style={[styles.worldTab, active && { borderColor: worldColor, backgroundColor: worldColor + '33' }]}>
                                <Text style={[styles.worldTabText, active && { color: worldColor }]}>W{w.id}</Text>
                                <Text style={styles.worldTabName}>{w.name}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <Text style={[styles.worldTitle, { color: wc.primary }]}>{WORLDS[selectedWorld].name.toUpperCase()}</Text>

            {/* Level grid */}
            <ScrollView contentContainerStyle={styles.grid}>
                {levels.map((lvl) => {
                    const unlocked = isUnlocked(lvl.id);
                    const prog = levelProgress[lvl.id];
                    const stars = prog?.stars ?? 0;
                    const isBoss = lvl.isBoss;
                    return (
                        <TouchableOpacity
                            key={lvl.id}
                            disabled={!unlocked}
                            activeOpacity={0.8}
                            onPress={() => {
                                setActiveLevel(lvl);
                                navigation.navigate('Game', { levelId: lvl.id });
                            }}
                        >
                            <LinearGradient
                                colors={unlocked
                                    ? isBoss ? ['#7f1d1d', '#dc2626'] : [wc.primary + 'cc', wc.secondary + 'aa']
                                    : ['#1e1e2e', '#1e1e2e']}
                                style={[styles.levelCard, isBoss && styles.bossCard, !unlocked && styles.locked]}
                            >
                                <Text style={styles.levelNum}>{unlocked ? (isBoss ? '👑' : lvl.id) : '🔒'}</Text>
                                <Text style={styles.levelName} numberOfLines={1}>{unlocked ? lvl.name : '???'}</Text>
                                <Text style={styles.stars}>{STARS[stars]}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 48 },
    header: { color: '#e2e8f0', fontSize: 22, fontWeight: '800', textAlign: 'center', letterSpacing: 3 },
    worldTabs: { marginTop: 16, maxHeight: 72 },
    worldTab: { borderRadius: 10, borderWidth: 2, borderColor: '#334155', padding: 8, alignItems: 'center', minWidth: 60 },
    worldTabText: { color: '#94a3b8', fontWeight: '800', fontSize: 16 },
    worldTabName: { color: '#64748b', fontSize: 10, marginTop: 2 },
    worldTitle: { textAlign: 'center', marginVertical: 12, fontSize: 20, fontWeight: '900', letterSpacing: 4 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 80 },
    levelCard: { width: 100, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4 },
    bossCard: { width: 100, borderWidth: 2, borderColor: '#fbbf24' },
    locked: { opacity: 0.45 },
    levelNum: { fontSize: 22, fontWeight: '900', color: '#fff' },
    levelName: { color: '#e2e8f0', fontSize: 10, fontWeight: '600', textAlign: 'center' },
    stars: { fontSize: 12, color: '#fbbf24', letterSpacing: 1 },
    backBtn: { position: 'absolute', bottom: 20, left: 20 },
    backText: { color: '#94a3b8', fontSize: 16 },
});
