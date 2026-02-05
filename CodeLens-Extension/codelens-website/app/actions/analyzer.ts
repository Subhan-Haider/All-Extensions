'use server';

import { detectStore, getDownloadUrl, ExtensionInfo } from '@/lib/extension-utils';

export async function fetchExtensionData(url: string) {
    try {
        const info = detectStore(url);
        if (!info) throw new Error('Invalid store URL');

        const downloadUrl = getDownloadUrl(info);
        if (!downloadUrl) throw new Error('Could not generate download URL');

        console.log(`[CodeLens] Syncing extension from: ${downloadUrl}`);

        const isChrome = info.store === 'chrome';
        const isEdge = info.store === 'edge';
        const isFirefox = info.store === 'firefox';

        let headers: Record<string, string> = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        };

        if (isChrome) {
            headers['Referer'] = 'https://chromewebstore.google.com/';
        } else if (isEdge) {
            headers['Referer'] = 'https://microsoftedge.microsoft.com/';
            // Edge sometimes requires an Edge UA
            headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0';
        } else if (isFirefox) {
            headers['Referer'] = 'https://addons.mozilla.org/';
        }

        const response = await fetch(downloadUrl, { headers });

        if (!response.ok) {
            console.error(`[CodeLens] Store response failed: ${response.status} ${response.statusText}`);

            // Fallback for Edge: If generic download fails, try Chrome Web Store as backup (since IDs often match)
            if (isEdge && response.status === 500) {
                console.log('[CodeLens] Retrying Edge download via Chrome Store backup...');
                const chromeFallbackUrl = `https://clients2.google.com/service/update2/crx?response=redirect&prodversion=110.0.5481.178&acceptformat=crx2,crx3&x=id%3D${info.id}%26installsource%3Dondemand%26uc`;
                const retryResponse = await fetch(chromeFallbackUrl, {
                    headers: {
                        'User-Agent': headers['User-Agent'],
                        'Referer': 'https://chromewebstore.google.com/'
                    }
                });
                if (retryResponse.ok) {
                    const arrayBuffer = await retryResponse.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    return {
                        success: true,
                        buffer: buffer.toString('base64'),
                        fileName: `${info.id}.crx`,
                        info
                    };
                }
            }

            if (response.status === 404) {
                throw new Error(`The extension ID "${info.id}" was not found in the ${info.store} store. Please check the URL.`);
            } else if (response.status === 403) {
                throw new Error(`The ${info.store} store blocked our access. This can happen if the store identifies us as a bot. Please try simulation mode.`);
            }

            throw new Error(`Store request failed (${response.status}). The extension might be private, geo-blocked, or removed.`);
        }

        const arrayBuffer = await response.arrayBuffer();
        console.log(`[CodeLens] Successfully fetched ${arrayBuffer.byteLength} bytes`);
        const buffer = Buffer.from(arrayBuffer);

        // In a real scenario, we might want to also fetch store metadata (name, icon)
        // using a scraper or an official API if available.
        // For now, we'll return the buffer and the basic info.

        return {
            success: true,
            buffer: buffer.toString('base64'),
            fileName: `${info.id}.${info.store === 'firefox' ? 'xpi' : 'crx'}`,
            info
        };

    } catch (error: any) {
        console.error('Fetch error:', error);
        return { success: false, error: error.message };
    }
}
