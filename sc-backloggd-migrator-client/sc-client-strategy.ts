import { BrowserWindow } from 'electron';
import { flushMetadata, pollUserCookie, pollUserMetadata } from '../sc-backloggd-migrator-gui/core/sc-user-metadata';
import { delay } from '../sc-backloggd-migrator-utils/delay';
import { SensCritiqueSSOAuthStrategy } from './sc-sso-auth-client';
import { SensCritiqueBaseAuthStrategy } from './sc-base-auth-client';
import { ISensCritiqueAuthStrategy } from './sc-client-strategy.interface';

export class SensCritiqueClientStrategy {
    static async build(window: BrowserWindow): Promise<ISensCritiqueAuthStrategy> {
        const strategiesMap: Record<'sso' | 'base', () => Promise<ISensCritiqueAuthStrategy>> = {
            sso: async () => {
                await flushMetadata(window);
                const firebaseMetaData = await pollUserMetadata(window);
                await delay(3000);
                console.log('✅ SSO mode enabled');
                return SensCritiqueSSOAuthStrategy.build(firebaseMetaData);
            },
            base: async () => {
                const cookie = await pollUserCookie(window);
                await delay(3000);
                console.log('✅ BaseAuth mode enabled');
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

