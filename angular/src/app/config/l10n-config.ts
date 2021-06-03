import { L10nConfig, L10nLoader } from 'angular-l10n';
import { i18nSharedAsset } from '../translations/shared';

export const l10nConfig: L10nConfig = {
    format: 'language-region',
    providers: [{ name: 'app', asset: i18nSharedAsset }],
    cache: true,
    keySeparator: '.',
    defaultLocale: { language: 'en' },
    schema: [
        {
            locale: { language: 'en' },
            dir: 'ltr',
            text: 'English'
        },
        {
            locale: { language: 'uk' },
            dir: 'ltr',
            text: 'Українська'
        }
    ]
};

export function initL10n(l10nLoader: L10nLoader): () => Promise<void> {
    return () => l10nLoader.init();
}
