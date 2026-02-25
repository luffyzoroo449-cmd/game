import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useGameStore } from '../store/gameStore';

const soundObjects = {};
const musicObject = { current: null };

const SFX_FILES = {
    jump: require('../../assets/audio/sfx_jump.mp3'),
    doubleJump: require('../../assets/audio/sfx_double_jump.mp3'),
    dash: require('../../assets/audio/sfx_dash.mp3'),
    wallJump: require('../../assets/audio/sfx_wall_jump.mp3'),
    collectCoin: require('../../assets/audio/sfx_coin.mp3'),
    collectGem: require('../../assets/audio/sfx_gem.mp3'),
    damage: require('../../assets/audio/sfx_damage.mp3'),
    death: require('../../assets/audio/sfx_death.mp3'),
    checkpoint: require('../../assets/audio/sfx_checkpoint.mp3'),
    enemyDeath: require('../../assets/audio/sfx_enemy_death.mp3'),
    levelComplete: require('../../assets/audio/sfx_level_complete.mp3'),
};

const BGM_FILES = {
    forest_theme: require('../../assets/audio/bgm_forest.mp3'),
    cave_theme: require('../../assets/audio/bgm_cave.mp3'),
    snow_theme: require('../../assets/audio/bgm_snow.mp3'),
    desert_theme: require('../../assets/audio/bgm_desert.mp3'),
    lava_theme: require('../../assets/audio/bgm_lava.mp3'),
    sky_theme: require('../../assets/audio/bgm_sky.mp3'),
    factory_theme: require('../../assets/audio/bgm_factory.mp3'),
    haunted_theme: require('../../assets/audio/bgm_haunted.mp3'),
    cyber_theme: require('../../assets/audio/bgm_cyber.mp3'),
    shadow_theme: require('../../assets/audio/bgm_shadow.mp3'),
    menu_theme: require('../../assets/audio/bgm_menu.mp3'),
};

export function useAudio() {
    const { settings } = useGameStore();

    const playSFX = async (name) => {
        if (!settings.sfx) return;
        const file = SFX_FILES[name];
        if (!file) return;
        try {
            const { sound } = await Audio.Sound.createAsync(file, { volume: 0.7 });
            await sound.playAsync();
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) sound.unloadAsync();
            });
        } catch (_) { }
    };

    const playBGM = async (bgmKey) => {
        await stopBGM();
        if (!settings.music) return;
        const file = BGM_FILES[bgmKey];
        if (!file) return;
        try {
            const { sound } = await Audio.Sound.createAsync(file, {
                isLooping: true,
                volume: 0.4,
                shouldPlay: true,
            });
            musicObject.current = sound;
        } catch (_) { }
    };

    const stopBGM = async () => {
        if (musicObject.current) {
            try {
                await musicObject.current.stopAsync();
                await musicObject.current.unloadAsync();
            } catch (_) { }
            musicObject.current = null;
        }
    };

    return { playSFX, playBGM, stopBGM };
}
