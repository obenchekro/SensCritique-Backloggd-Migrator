import { BrowserWindow } from 'electron';
import { pollUserCookie, pollUserMetadata } from '../sc-backloggd-migrator-gui/core/sc-user-metadata';
import { delay } from '../sc-backloggd-migrator-utils/delay';
import { SensCritiqueSSOAuthClient } from './sc-sso-auth-client';
import { SensCritiqueBaseAuthStrategy } from './sc-base-auth-client';

export class SensCritiqueClientStrategy {
    static async build(window: BrowserWindow): Promise<SensCritiqueSSOAuthClient | SensCritiqueBaseAuthStrategy> {
        const strategiesMap: Record<'sso' | 'base', () => Promise<SensCritiqueSSOAuthClient | SensCritiqueBaseAuthStrategy>> = {
            sso: async () => {
                const firebaseMetaData = await pollUserMetadata(window);
                await delay(3000);
                console.log('✅ SSO mode enabled');
                return SensCritiqueSSOAuthClient.build(firebaseMetaData);
            },
            base: async () => {
                console.log('✅ BaseAuth mode enabled');
                const cookie = await pollUserCookie(window);
                await delay(3000);
                return SensCritiqueBaseAuthStrategy.build(cookie!);
            }
        };

        try {
            return Promise.any([
                strategiesMap.sso(),
                strategiesMap.base()
            ]);
        } catch (_) {
            throw new Error('SensCritique Client Auth mode failed.');
        }
    }
}

