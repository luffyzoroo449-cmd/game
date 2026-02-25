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

            {/* Back Layer (Slowest) */}
            <View style={[styles.layer, { transform: [{ translateX: -scrollX * 0.1 }] }]}>
                <View style={[styles.mountain, { left: 50, bottom: -50, width: 300, height: 200, opacity: 0.2 }]} />
                <View style={[styles.mountain, { left: 400, bottom: -80, width: 400, height: 250, opacity: 0.15 }]} />
            </View>

            {/* Middle Layer */}
            <View style={[styles.layer, { transform: [{ translateX: -scrollX * 0.3 }] }]}>
                <View style={[styles.cloud, { left: 100, top: 40, width: 120, height: 30, opacity: 0.3 }]} />
                <View style={[styles.cloud, { left: 500, top: 80, width: 160, height: 40, opacity: 0.2 }]} />
            </View>

            {/* Front Layer (Fastest, just above floor) */}
            <View style={[styles.layer, { transform: [{ translateX: -scrollX * 0.5 }] }]}>
                {/* Subtle ground fog or silhouettes could go here */}
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
});

export default ParallaxBackground;
