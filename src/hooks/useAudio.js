import { useEffect, useRef } from 'react';
// import { Audio } from 'expo-av';
import { useGameStore } from '../store/gameStore';

// Temporary dummy objects to bypass potential asset loading issues on web
const SFX_FILES = {};
const BGM_FILES = {};
const musicObject = { current: null };

export function useAudio() {
    const { settings } = useGameStore();

    const playSFX = async (name) => {
        console.log('SFX play requested:', name);
        // if (!settings.sfx) return;
        return;
    };

    const playBGM = async (bgmKey) => {
        console.log('BGM play requested:', bgmKey);
        // await stopBGM();
        return;
    };

    const stopBGM = async () => {
        return;
    };

    return { playSFX, playBGM, stopBGM };
}
