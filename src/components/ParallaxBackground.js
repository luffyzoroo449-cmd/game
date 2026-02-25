import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * ParallaxBackground: Multi-layered background with different scroll speeds.
 * Even for single-screen levels, subtle movements (e.g. cloud sway) add "life".
 */
const ParallaxBackground = ({ world, scrollX = 0 }) => {
    const colors = world.skyColors || ['#0a0a0f', '#1e1b2e'];

    return (
        <View style={StyleSheet.absoluteFill}>
            <LinearGradient colors={colors} style={StyleSheet.absoluteFill} />

            {/* Back Layer (Mountains/Ruins) */}
            <View style={[styles.layer, { transform: [{ translateX: -scrollX * 0.1 }] }]}>
                <View style={[styles.mountain, { left: 50, bottom: -50, width: 300, height: 200, opacity: 0.2, backgroundColor: world.name === 'Lava' ? '#450a0a' : '#000' }]} />
                <View style={[styles.mountain, { left: 400, bottom: -80, width: 400, height: 250, opacity: 0.15, backgroundColor: world.name === 'Lava' ? '#450a0a' : '#000' }]} />
                <View style={[styles.mountain, { left: 800, bottom: -60, width: 350, height: 180, opacity: 0.1, backgroundColor: world.name === 'Lava' ? '#450a0a' : '#000' }]} />
            </View>

            {/* Middle Layer (Clouds/Particles) */}
            <View style={[styles.layer, { transform: [{ translateX: -scrollX * 0.3 }] }]}>
                <View style={[styles.cloud, { left: 100, top: 40, width: 120, height: 30, opacity: 0.3, backgroundColor: world.name === 'Void' ? '#a855f7' : '#fff' }]} />
                <View style={[styles.cloud, { left: 500, top: 80, width: 160, height: 40, opacity: 0.2, backgroundColor: world.name === 'Void' ? '#a855f7' : '#fff' }]} />
                <View style={[styles.cloud, { left: 900, top: 50, width: 80, height: 20, opacity: 0.25, backgroundColor: world.name === 'Void' ? '#a855f7' : '#fff' }]} />

                {world.name === 'Lava' && (
                    <>
                        <View style={[styles.ember, { left: 200, top: 300, width: 4, height: 4, backgroundColor: '#fb923c' }]} />
                        <View style={[styles.ember, { left: 600, top: 350, width: 6, height: 6, backgroundColor: '#ea580c' }]} />
                    </>
                )}
            </View>

            {/* Front Layer */}
            <View style={[styles.layer, { transform: [{ translateX: -scrollX * 0.5 }] }]}>
                {world.name === 'Void' && <View style={[styles.orb, { left: 300, top: 200 }]} />}
                {world.name === 'Void' && <View style={[styles.orb, { left: 700, top: 100 }]} />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    layer: {
        ...StyleSheet.absoluteFillObject,
    },
    mountain: {
        position: 'absolute',
        backgroundColor: '#000',
        transform: [{ rotate: '45deg' }],
    },
    cloud: {
        position: 'absolute',
        backgroundColor: '#fff',
        borderRadius: 20,
    },
    ember: {
        position: 'absolute',
        borderRadius: 2,
    },
    orb: {
        position: 'absolute',
        width: 15,
        height: 15,
        borderRadius: 7.5,
        backgroundColor: '#a855f7',
        shadowColor: '#a855f7',
        shadowRadius: 15,
        shadowOpacity: 0.8,
        elevation: 10,
    },
});

export default ParallaxBackground;
