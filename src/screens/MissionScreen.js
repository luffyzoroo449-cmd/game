import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../store/gameStore';

export default function MissionScreen({ navigation }) {
    const { missions, claimMission } = useGameStore();

    return (
        <LinearGradient colors={['#0a0a0f', '#0f172a', '#0a0a0f']} style={styles.container}>
            <Text style={styles.header}>🎯  Missions</Text>

            <ScrollView contentContainerStyle={styles.list}>
                {missions.map((m) => {
                    const progress = m.current / m.target;
                    const canClaim = m.current >= m.target && !m.claimed;

                    return (
                        <View key={m.id} style={[styles.card, m.claimed && { opacity: 0.6 }]}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.label}>{m.label}</Text>
                                <Text style={styles.reward}>💎 {m.reward}</Text>
                            </View>

                            <View style={styles.progressBg}>
                                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                            </View>

                            <View style={styles.cardFooter}>
                                <Text style={styles.status}>
                                    {m.claimed ? '✅ Claimed' : `${m.current} / ${m.target}`}
                                </Text>

                                {canClaim && (
                                    <TouchableOpacity style={styles.claimBtn} onPress={() => claimMission(m.id)}>
                                        <Text style={styles.claimText}>CLAIM</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
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
    header: { color: '#e2e8f0', fontSize: 26, fontWeight: '900', textAlign: 'center', letterSpacing: 4, marginBottom: 24 },
    list: { paddingHorizontal: 20, gap: 16, paddingBottom: 100 },
    card: { backgroundColor: '#1e1b2e', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#334155' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    label: { color: '#f1f5f9', fontSize: 16, fontWeight: '700' },
    reward: { color: '#818cf8', fontWeight: '800' },
    progressBg: { height: 8, backgroundColor: '#0f172a', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
    progressFill: { height: '100%', backgroundColor: '#7c3aed', borderRadius: 4 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    status: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
    claimBtn: { backgroundColor: '#22c55e', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
    claimText: { color: '#fff', fontSize: 13, fontWeight: '900' },
    backBtn: { position: 'absolute', bottom: 24, left: 24 },
    backText: { color: '#94a3b8', fontSize: 16 },
});
