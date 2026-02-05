export type StoreType = 'chrome' | 'edge' | 'firefox' | 'opera' | null;

export interface ExtensionInfo {
    id: string;
    store: StoreType;
    url: string;
}

export function detectStore(inputUrl: string): ExtensionInfo | null {
    try {
        let url = inputUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        const uri = new URL(url);
        const host = uri.hostname.toLowerCase();

        // Chrome Web Store (Old and New)
        if (host.includes('chrome.google.com') || host.includes('chromewebstore.google.com')) {
            // Match 32 character ID. It can be in /webstore/detail/.../[id] or /detail/[id]
            const idMatch = url.match(/\/([a-p]{32})([/?]|$)/i) || url.match(/\/detail\/[^/]+\/([a-p]{32})/i) || url.match(/\/detail\/([a-p]{32})/i);
            if (idMatch && idMatch[1]) {
                return { id: idMatch[1], store: 'chrome', url };
            }
        }

        // Microsoft Edge Add-ons
        if (host.includes('microsoftedge.microsoft.com')) {
            const idMatch = url.match(/\/([a-zA-Z0-9]{32})([/?]|$)/) || url.match(/\/detail\/[^/]+\/([a-zA-Z0-9]{32})/);
            if (idMatch && idMatch[1]) {
                return { id: idMatch[1], store: 'edge', url };
            }

            const parts = uri.pathname.split('/').filter(p => p.length > 0);
            const pathId = parts[parts.length - 1];
            if (pathId && pathId.length >= 32) return { id: pathId, store: 'edge', url };
        }

        // Firefox Add-ons
        if (host.includes('addons.mozilla.org')) {
            const parts = uri.pathname.split('/').filter(p => p.length > 0);
            // URL usually: /en-US/firefox/addon/slug/
            const addonIndex = parts.indexOf('addon');
            if (addonIndex !== -1 && addonIndex + 1 < parts.length) {
                return { id: parts[addonIndex + 1], store: 'firefox', url };
            }
        }

        // Opera Add-ons
        if (host.includes('addons.opera.com')) {
            const parts = uri.pathname.split('/');
            const detailsIndex = parts.indexOf('details');
            if (detailsIndex !== -1 && detailsIndex + 1 < parts.length) {
                return { id: parts[detailsIndex + 1], store: 'opera', url };
            }
        }

        return null;
    } catch (e) {
        // If URL parsing fails, check if the input itself is a raw ID
        const rawInput = inputUrl.trim();

        // Chrome/Edge ID: 32 characters, a-p (strictly) or a-z (loosely)
        // We default to Chrome as it's the most likely source for a raw ID
        if (/^[a-z]{32}$/i.test(rawInput)) {
            return {
                id: rawInput,
                store: 'chrome',
                url: `https://chromewebstore.google.com/detail/${rawInput}`
            };
        }

        // Firefox ID (UUID format)
        if (/^\{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}$/i.test(rawInput)) {
            return {
                id: rawInput,
                store: 'firefox',
                url: `https://addons.mozilla.org/firefox/addon/${rawInput}`
            };
        }

        console.error('URL parse error:', e);
        return null;
    }
}

export function getDownloadUrl(info: ExtensionInfo): string {
    switch (info.store) {
        case 'chrome':
            return `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=110.0.5481.178&acceptformat=crx2,crx3&x=id%3D${info.id}%26installsource%3Dondemand%26uc`;
        case 'edge':
            // Simplified generic URL to avoid version mismatch errors
            return `https://edge.microsoft.com/extensionwebstorebase/v1/crx?response=redirect&prod=chromiumcrx&prodversion=unknown&x=id%3D${info.id}%26installsource%3Dondemand%26uc`;
        case 'firefox':
            // This is a bit trickier as the download URL typically contains the version.
            // We might need to fetch the metadata first.
            return `https://addons.mozilla.org/firefox/downloads/latest/${info.id}/addon-${info.id}-latest.xpi`;
        default:
            return '';
    }
}
