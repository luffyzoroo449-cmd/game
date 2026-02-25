import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRank } from '../game/constants/DifficultyConfig';
import { SKINS } from '../game/constants/GameConstants';

const SAVE_KEY = '@shadowrise_save';

const defaultSave = {
    coins: 0,
    gems: 0,
    totalXP: 0,
    rank: 'Bronze',
    currentLevel: 1,
    levelProgress: {},   // { [levelId]: { stars, bestTime, unlocked } }
    ownedSkins: ['default'],
    activeSkin: 'default',
    settings: { music: true, sfx: true },
    isPremium: false,
};

export const useGameStore = create((set, get) => ({
    ...defaultSave,

    // --- Persistence ---
    loadSave: async () => {
        try {
            const raw = await AsyncStorage.getItem(SAVE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                set({ ...defaultSave, ...saved });
            }
        } catch (_) { }
    },

    _persist: async () => {
        const { loadSave, _persist, ...state } = get();
        try { await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (_) { }
    },

    resetSave: async () => {
        set(defaultSave);
        try { await AsyncStorage.removeItem(SAVE_KEY); } catch (_) { }
    },

    // --- Level Progress ---
    completeLevel: (levelId, stars, xp, coins, gems) => {
        set((s) => {
            const prev = s.levelProgress[levelId] ?? { stars: 0, unlocked: true };
            const newStars = Math.max(prev.stars ?? 0, stars);
            const newXP = s.totalXP + xp;
            const newCoins = s.coins + coins;
            const newGems = s.gems + gems;
            const newProgress = {
                ...s.levelProgress,
                [levelId]: { stars: newStars, unlocked: true },
                [levelId + 1]: { ...(s.levelProgress[levelId + 1] ?? {}), unlocked: true },
            };
            const newState = {
                coins: newCoins,
                gems: newGems,
                totalXP: newXP,
                rank: getRank(newXP),
                currentLevel: Math.max(s.currentLevel, levelId + 1),
                levelProgress: newProgress,
            };
            return newState;
        });
        get()._persist();
    },

    unlockLevel: (levelId) => {
        set((s) => ({
            levelProgress: {
                ...s.levelProgress,
                [levelId]: { ...(s.levelProgress[levelId] ?? {}), unlocked: true },
            },
        }));
        get()._persist();
    },

    // --- Skins ---
    buySkin: (skinId) => {
        const skin = SKINS.find(sk => sk.id === skinId);
        if (!skin) return false;
        const { gems, ownedSkins, isPremium } = get();
        if (skin.premiumOnly && !isPremium) return false;
        if (ownedSkins.includes(skinId)) return true;
        if (gems < skin.cost) return false;
        set((s) => ({ gems: s.gems - skin.cost, ownedSkins: [...s.ownedSkins, skinId] }));
        get()._persist();
        return true;
    },

    setActiveSkin: (skinId) => {
        set({ activeSkin: skinId });
        get()._persist();
    },

    // --- Settings ---
    toggleMusic: () => {
        set((s) => ({ settings: { ...s.settings, music: !s.settings.music } }));
        get()._persist();
    },

    toggleSFX: () => {
        set((s) => ({ settings: { ...s.settings, sfx: !s.settings.sfx } }));
        get()._persist();
    },

    // --- Premium ---
    unlockPremium: () => {
        set((s) => ({
            isPremium: true,
            ownedSkins: s.ownedSkins.includes('premium') ? s.ownedSkins : [...s.ownedSkins, 'premium'],
        }));
        get()._persist();
    },

    // --- Active session ---
    activeLevel: null,
    setActiveLevel: (level) => set({ activeLevel: level }),
}));
