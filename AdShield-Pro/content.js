// Content script for AdShield Pro - runs on all pages

(function () {
    'use strict';

    // Check if extension is enabled
    chrome.storage.local.get(['enabled', 'whitelist', 'cosmeticRules', 'stealthMode'], (result) => {
        if (chrome.runtime.lastError) {
            console.log('AdShield Pro: Context invalidated, stopping script.');
            return;
        }
        const enabled = result.enabled !== false;
        const whitelist = result.whitelist || [];
        const cosmeticRules = result.cosmeticRules || {};
        const stealthMode = result.stealthMode !== false;
        const currentHostname = window.location.hostname;

        if (!enabled || whitelist.includes(currentHostname)) {
            return;
        }

        // Initialize ad blocker
        initAdBlocker(cosmeticRules[currentHostname] || [], stealthMode);
    });

    function initAdBlocker(customRules, stealthMode) {
        // Stealth Mode: Hide adblocker presence
        if (stealthMode) {
            applyStealthMode();
        }

        // Apply custom cosmetic rules from element picker
        applyCosmeticRules(customRules);

        // Remove common ad elements
        removeAdElements();

        // Block ad scripts
        blockAdScripts();

        // Handle YouTube video ads specifically
        if (window.location.hostname.includes('youtube.com')) {
            handleYouTubeAds();
        }

        // Clean up page periodically
        setInterval(() => {
            removeAdElements();
            applyCosmeticRules(customRules);
            if (window.location.hostname.includes('youtube.com')) {
                handleYouTubeAds();
            }
        }, 1000);

        // Observe DOM changes
        observeDOMChanges(customRules);
    }

    function applyStealthMode() {
        // Spoof properties that anti-adblockers check
        try {
            Object.defineProperty(window, 'adsbygoogle', {
                get: () => [],
                set: () => { },
                configurable: true
            });
            window.canRunAds = true;
        } catch (e) { }
    }

    function applyCosmeticRules(rules) {
        if (!rules || rules.length === 0) return;
        rules.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(el => el.style.display = 'none');
            } catch (e) { }
        });
    }

    // Remove common ad elements
    function removeAdElements() {
        const adSelectors = [
            // Generic ad selectors
            '[class*="ad-"]',
            '[class*="ads-"]',
            '[id*="ad-"]',
            '[id*="ads-"]',
            '[class*="banner"]',
            '[class*="popup"]',
            '[class*="sponsor"]',
            '[class*="advertisement"]',

            // Common ad containers
            '.ad',
            '.ads',
            '.advert',
            '.advertising',
            '.banner-ad',
            '.google-ad',
            '.sponsored',
            '.sponsorship',

            // Specific ad networks
            'ins.adsbygoogle',
            '.adsbygoogle',
            'iframe[src*="doubleclick"]',
            'iframe[src*="googlesyndication"]',
            'iframe[src*="advertising"]',
            'iframe[src*="ad."]',

            // Social media widgets
            '[class*="social-share"]',
            '[class*="share-buttons"]',

            // Cookie notices (optional)
            '[class*="cookie-notice"]',
            '[class*="cookie-banner"]',
            '[id*="cookie-consent"]'
        ];

        adSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // Check if element looks like an ad
                    if (isAdElement(element)) {
                        element.remove();
                    }
                });
            } catch (e) {
                // Ignore invalid selectors
            }
        });
    }

    // Check if element is likely an ad
    function isAdElement(element) {
        const text = (element.textContent || '').toLowerCase();

        // Handle cases where className is an object (like SVGAnimatedString)
        let classStr = '';
        if (typeof element.className === 'string') {
            classStr = element.className;
        } else if (element.getAttribute) {
            classStr = element.getAttribute('class') || '';
        }
        const className = classStr.toLowerCase();

        const id = (element.id || '').toLowerCase();

        const adKeywords = [
            'advertisement',
            'sponsored',
            'promotion',
            'ad by',
            'ads by'
        ];

        // Check text content
        for (const keyword of adKeywords) {
            if (text.includes(keyword)) {
                return true;
            }
        }

        // Check class and id
        const adPatterns = /ad[s]?[-_]|banner|popup|sponsor|promo/i;
        if (adPatterns.test(className) || adPatterns.test(id)) {
            return true;
        }

        // Check dimensions (common ad sizes)
        const rect = element.getBoundingClientRect();
        const commonAdSizes = [
            { width: 728, height: 90 },   // Leaderboard
            { width: 300, height: 250 },  // Medium Rectangle
            { width: 160, height: 600 },  // Wide Skyscraper
            { width: 300, height: 600 },  // Half Page
            { width: 970, height: 250 },  // Billboard
            { width: 320, height: 50 },   // Mobile Banner
            { width: 320, height: 100 }   // Large Mobile Banner
        ];

        for (const size of commonAdSizes) {
            if (Math.abs(rect.width - size.width) < 10 &&
                Math.abs(rect.height - size.height) < 10) {
                return true;
            }
        }

        return false;
    }

    // Block ad scripts
    function blockAdScripts() {
        const scriptBlockList = [
            'doubleclick.net',
            'googlesyndication.com',
            'googleadservices.com',
            'google-analytics.com',
            'facebook.net',
            'scorecardresearch.com',
            'outbrain.com',
            'taboola.com',
            'advertising.com',
            'adnxs.com',
            'adsystem.com'
        ];

        // Block scripts in head
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            const src = script.getAttribute('src');
            if (src && scriptBlockList.some(blocked => src.includes(blocked))) {
                script.remove();
            }
        });
    }

    // Observe DOM changes for dynamically loaded ads
    function observeDOMChanges(customRules) {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // Element node
                        // Apply cosmetic rules
                        applyCosmeticRules(customRules);

                        // Check if the added node is an ad
                        if (isAdElement(node)) {
                            node.remove();
                        }

                        // Check children
                        const adElements = node.querySelectorAll('[class*="ad-"], [id*="ad-"], .adsbygoogle');
                        adElements.forEach(el => {
                            if (isAdElement(el)) {
                                el.remove();
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Clean up empty containers left by removed ads
    function cleanupEmptyContainers() {
        const containers = document.querySelectorAll('div, section, aside');
        containers.forEach(container => {
            if (container.children.length === 0 &&
                container.textContent.trim() === '' &&
                container.offsetHeight > 50) {
                container.style.display = 'none';
            }
        });
    }

    // YouTube Specific Auto-Skip and Ad Removal
    function handleYouTubeAds() {
        const video = document.querySelector('video');
        const adContainer = document.querySelector('.video-ads.ytp-ad-module');
        const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-skip-ad-button');
        const overlayAds = document.querySelectorAll('.ytp-ad-overlay-container, .ytp-ad-image-overlay');

        // 1. Auto-Click Skip Button
        if (skipButton) {
            skipButton.click();
            console.log('AdShield Pro: YouTube Ad Skipped');
        }

        // 2. Faster playback for unskippable ads
        if (video && adContainer && adContainer.children.length > 0) {
            // Speed up the ad to near-instant if possible
            video.playbackRate = 16;
            video.muted = true;
            // Seek to end
            if (video.duration) {
                video.currentTime = video.duration - 0.1;
            }
        }

        // 3. Remove overlay ads
        overlayAds.forEach(el => el.style.display = 'none');

        // 4. Clean up sidebar/home ads
        const staticAds = document.querySelectorAll('ytd-ad-slot-renderer, #masthead-ad, .ytd-merch-shelf-renderer');
        staticAds.forEach(el => el.remove());
    }

    // Clean up
    setTimeout(cleanupEmptyContainers, 3000);

})();
