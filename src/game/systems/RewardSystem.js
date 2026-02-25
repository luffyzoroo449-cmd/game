import { computeXP, getLevelStars, getParTime } from '../constants/DifficultyConfig';

const RewardSystem = (entities, { dispatch, events }) => {
    const meta = entities['levelMeta'];
    if (!meta) return entities;

    if (!meta.startTime) meta.startTime = Date.now();

    // Listen for levelComplete event dispatched by CollisionSystem
    (events || []).forEach((e) => {
        if (e.type === 'levelComplete') {
            const player = entities['player'];
            const timeTaken = (Date.now() - meta.startTime) / 1000;
            const parTime = getParTime(meta.levelId);
            const damageTaken = player?.damageTaken ?? 0;
            const coinsCollected = player?.coins ?? 0;
            const totalCoins = meta.totalCoins ?? 1;
            const stars = getLevelStars(timeTaken, parTime, damageTaken, coinsCollected, totalCoins);
            const xp = computeXP(meta.levelId, timeTaken, parTime, damageTaken, stars);

            dispatch({
                type: 'levelReward',
                stars,
                xp,
                coins: coinsCollected,
                gems: player?.gems ?? 0,
                timeTaken,
            });
        }
    });

    return entities;
};

export default RewardSystem;
