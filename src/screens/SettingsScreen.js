import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';

export default function SettingsScreen({ navigation }) {
    const { settings, toggleMusic, toggleSFX, totalXP, rank, coins, gems, currentLevel, resetSave } = useGameStore();

    const rows = [
        { label: '🎵  Background Music', value: settings.music, onToggle: toggleMusic },
        { label: '🔊  Sound Effects', value: settings.sfx, onToggle: toggleSFX },
    ];

    return (
        <LinearGradient colors={['#0a0a0f', '#120a2a', '#0a0a0f']} style={styles.container}>
            <Text style={styles.header}>⚙️  Settings</Text>

            {/* Audio */}
            <Text style={styles.section}>AUDIO</Text>
            {rows.map((r, i) => (
                <View key={i} style={styles.row}>
                    <Text style={styles.rowLabel}>{r.label}</Text>
                    <Switch value={r.value} onValueChange={r.onToggle} trackColor={{ false: '#334155', true: '#7c3aed' }} thumbColor="#e2e8f0" />
                </View>
            ))}

            {/* Stats */}
            <Text style={styles.section}>PROFILE</Text>
            {[
                ['🏅  Rank', rank],
                ['✨  Total XP', totalXP],
                ['🪙  Coins', coins],
                ['💎  Gems', gems],
                ['📍  Level', currentLevel],
            ].map(([label, val]) => (
                <View key={label} style={styles.row}>
                    <Text style={styles.rowLabel}>{label}</Text>
                    <Text style={styles.rowVal}>{val}</Text>
                </View>
            ))}

            {/* Reset */}
            <TouchableOpacity style={styles.resetBtn} onPress={() => {
                const { Alert } = require('react-native');
                Alert.alert('Reset Save?', 'This will erase all progress. Are you sure?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Reset', style: 'destructive', onPress: () => { resetSave(); navigation.replace('MainMenu'); } },
                ]);
            }}>
                <Text style={styles.resetText}>🗑  Reset All Progress</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 56, paddingHorizontal: 24 },
    header: { color: '#e2e8f0', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 24, letterSpacing: 3 },
    section: { color: '#475569', fontSize: 12, fontWeight: '800', letterSpacing: 3, marginTop: 20, marginBottom: 8 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1e1b2e', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8 },
    rowLabel: { color: '#e2e8f0', fontSize: 15, fontWeight: '600' },
    rowVal: { color: '#818cf8', fontSize: 16, fontWeight: '800' },
    resetBtn: { marginTop: 32, backgroundColor: '#2d1515', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#ef444433' },
    resetText: { color: '#ef4444', fontSize: 15, fontWeight: '700' },
    backBtn: { position: 'absolute', bottom: 24, left: 24 },
    backText: { color: '#94a3b8', fontSize: 16 },
});
