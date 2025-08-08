import { useCallback, useEffect } from 'react';
import useStore from '../store/index';
import { debugLog } from '../lib/debugLog';
import { alertsMap } from '../data/alerts';
import { playAlertSound } from '../lib/playAlertSound';

let isMonitoring = false;
let globalInterval: number | null = null;
let globalLastChange = Date.now();
let globalLastValues: { hp: number; dren: number; pray: number } | null = null;
let globalLastCheck = 0;
const MAX_CHANGE = 0.32;

export function useCombatMonitor() {
    const checkCombat = useCallback((data: { hp: number; dren: number; pray: number }) => {
        const enabledAlerts = useStore.getState().alerts;
        const isInCombat = useStore.getState().inCombat;
        const now = Date.now();
        const { hp, dren, pray } = data;

        if (now - globalLastCheck < 500) return;
        globalLastCheck = now;

        const previous = globalLastValues;
        const changed = !previous || hp !== previous.hp || dren !== previous.dren || pray !== previous.pray;

        // === Prayer read validation ===
        if (previous) {
            const prevPrayer = previous.pray;
            const delta = prevPrayer - pray;

            if (delta > 0) {
                debugLog.info(`Prayer change rate:`, delta);
                // Hard cap: any drop > 320 is invalid
                if (delta > MAX_CHANGE) {
                    debugLog.error(`Discarded invalid prayer read: dropped by ${delta} (>320)`);
                    return;
                }
                if (data.pray <= 0.46 && prevPrayer > 0.46 && isInCombat && enabledAlerts['Sip Prayer']) {
                    debugLog.info(`Can safely sip a prayer pot`);
                    const alert = alertsMap.find((a) => a.key === 'Sip Prayer');
                    if (alert) {
                        playAlertSound(alert.key, alert.filename);
                    }
                }
                if (data.pray <= 0.3 && prevPrayer > 0.3 && isInCombat && enabledAlerts['Prayer (Low)']) {
                  debugLog.info(`Player's prayer is very low`);
                    const alert = alertsMap.find((a) => a.key === 'Prayer (Low)');
                    if (alert) {
                        playAlertSound(alert.key, alert.filename);
                    }
                }
                if (data.pray === 0 && prevPrayer !== 0 && isInCombat && enabledAlerts['Prayer (Empty)']) {
                    debugLog.info(`Player has ran out of prayer.`);
                    const alert = alertsMap.find((a) => a.key === 'Prayer (Empty)');
                    if (alert) {
                      playAlertSound(alert.key, alert.filename);
                    }
                }
            }

            if (hp < 0.15 && previous.hp > 0.15 && isInCombat && enabledAlerts['Health (Low)']) {
                debugLog.info(`Player is low on HP.`);
                const alert = alertsMap.find((a) => a.key === 'Health (Low)');
                if (alert) {
                    playAlertSound('Health (Low)', alert.filename);
                }
            }
        }

        // === Normal update flow ===
        if (changed) {
            globalLastChange = now;
            globalLastValues = { hp, dren, pray };

            const inCombat = useStore.getState().inCombat;
            if (!inCombat) {
                debugLog.info('User has entered combat.');
                useStore.getState().setInCombat(true);
            }

            debugLog.verbose(`HP: ${hp} | Adrenaline: ${dren} | Prayer: ${pray}`);
        }
    }, []);

    useEffect(() => {
        if (isMonitoring) return;

        isMonitoring = true;

        globalInterval = window.setInterval(() => {
            const now = Date.now();
            const inCombat = useStore.getState().inCombat;

            // Leave combat if no change has happened for 5 seconds
            if (inCombat && now - globalLastChange > 5000) {
                debugLog.info('User has left combat.');
                useStore.getState().setInCombat(false);
            }
        }, 500);

        return () => {
            if (globalInterval !== null) {
                clearInterval(globalInterval);
                globalInterval = null;
                isMonitoring = false;
            }
        };
    }, []);

    return checkCombat;
}
