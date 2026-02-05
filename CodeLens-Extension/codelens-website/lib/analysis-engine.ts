import JSZip from 'jszip';

export interface ExtractedFile {
    name: string;
    path: string;
    type: 'file' | 'folder';
    content?: string;
    children?: ExtractedFile[];
}

export async function processExtensionBuffer(base64: string): Promise<ExtractedFile[]> {
    if (!base64) throw new Error('Empty package data received.');

    // Sanitize base64 string
    // 1. Remove data URL prefix
    // 2. Remove all whitespace (new lines, spaces, etc)
    // 3. Convert URL-safe base64 to standard base64
    // 4. Ensure correct padding
    let sanitizedBase64 = base64
        .trim()
        .replace(/^data:.*,/, '')
        .replace(/\s/g, '')
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const padding = sanitizedBase64.length % 4;
    if (padding > 0) {
        sanitizedBase64 += '='.repeat(4 - padding);
    }

    let binary: string;
    try {
        binary = atob(sanitizedBase64);
    } catch (e) {
        console.error('[CodeLens] Base64 Decode Error:', e);
        console.error('[CodeLens] Sanity Check - Length:', sanitizedBase64.length);
        throw new Error('Package data is malformed. This usually happens when the store response is corrupted, blocked, or contains invalid characters.');
    }

    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    // Detect if it's a CRX file and strip header if needed
    // CRX header starts with 'Cr24'
    let zipData: Uint8Array = bytes;
    if (bytes[0] === 0x43 && bytes[1] === 0x72 && bytes[2] === 0x32 && bytes[3] === 0x34) {
        // It's a CRX. We need to find the PK... start of the zip.
        const pkIndex = bytes.findIndex((b, i) => b === 0x50 && bytes[i + 1] === 0x4B && bytes[i + 2] === 0x03 && bytes[i + 3] === 0x04);
        if (pkIndex !== -1) {
            zipData = bytes.slice(pkIndex);
        }
    }

    const zip = new JSZip();
    const loadedZip = await zip.loadAsync(zipData);

    const files: ExtractedFile[] = [];
    const fileMap: Record<string, ExtractedFile> = {};

    const sortedKeys = Object.keys(loadedZip.files).sort();

    for (const path of sortedKeys) {
        const file = loadedZip.files[path];
        const parts = path.split('/').filter(p => p !== '');
        if (parts.length === 0) continue;

        let currentLevel = files;
        let currentPath = '';

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            currentPath += (currentPath ? '/' : '') + part;
            const isLast = i === parts.length - 1;
            const isFolder = !isLast || file.dir;

            let node = fileMap[currentPath];
            if (!node) {
                node = {
                    name: part,
                    path: currentPath,
                    type: isFolder ? 'folder' : 'file'
                };
                if (isFolder) node.children = [];
                else {
                    // Read content for files
                    const ext = part.split('.').pop()?.toLowerCase();
                    const textExtensions = ['json', 'js', 'html', 'css', 'md', 'txt', 'ts', 'jsx', 'tsx', 'xml', 'yml', 'yaml', 'mjs', 'cjs', 'less', 'scss', 'map', 'svg'];
                    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'];

                    if (ext && textExtensions.includes(ext)) {
                        node.content = await file.async('string');
                    } else if (ext && imageExtensions.includes(ext)) {
                        node.content = 'data:image/' + (ext === 'svg' ? 'svg+xml' : ext) + ';base64,' + await file.async('base64');
                    } else {
                        // Better fallback: Try to read as string first, then check if it looks like binary
                        const raw = await file.async('string');
                        const isLikelyBinary = /[\x00-\x08\x0E-\x1F\x80-\xFF]/.test(raw.slice(0, 1024));

                        if (!isLikelyBinary || raw.length === 0) {
                            node.content = raw;
                        } else {
                            node.content = '[Binary Data]';
                        }
                    }
                }
                fileMap[currentPath] = node;
                currentLevel.push(node);
            }

            if (isFolder) {
                currentLevel = node.children!;
            }
        }
    }

    return files;
}

// Enhanced Security Audit with comprehensive analysis
export function performSecurityAudit(files: ExtractedFile[]) {
    let issues = 0;
    let riskScore = 0;
    const findings: string[] = [];
    const trackers: string[] = [];
    const domains: Set<string> = new Set();
    const suspiciousPatterns: string[] = [];
    const secretFindings: Array<{ label: string; file: string; line: number; snippet: string }> = [];
    const networkRequests: Array<{ type: string; url: string; file: string }> = [];
    const storageUsage: Array<{ type: string; file: string }> = [];
    const contentScriptBehaviors: string[] = [];
    const backgroundBehaviors: string[] = [];

    // Code quality metrics
    let minifiedFiles = 0;
    let obfuscatedFiles = 0;
    let totalJsFiles = 0;
    let totalCssFiles = 0;
    let totalHtmlFiles = 0;
    let totalAssets = 0;

    // Permission categorization
    const permissionCategories = {
        dangerous: [] as string[],
        moderate: [] as string[],
        safe: [] as string[]
    };

    // Smart Signatures
    const signatures = {
        trackers: [
            { pattern: 'google-analytics.com', name: 'Google Analytics' },
            { pattern: 'googletagmanager.com', name: 'Google Tag Manager' },
            { pattern: 'mixpanel.com', name: 'Mixpanel' },
            { pattern: 'segment.io', name: 'Segment' },
            { pattern: 'facebook.net', name: 'Facebook Pixel' },
            { pattern: 'hotjar.com', name: 'Hotjar' },
            { pattern: 'sentry.io', name: 'Sentry' },
            { pattern: 'bugsnag', name: 'Bugsnag' },
            { pattern: 'amplitude.com', name: 'Amplitude' },
            { pattern: 'fullstory.com', name: 'FullStory' }
        ],
        dangerous: [
            { pattern: 'eval\\(', label: 'Dangerous eval() usage detected', weight: 25 },
            { pattern: 'Function\\(', label: 'Dynamic Function constructor', weight: 25 },
            { pattern: 'document\\.write\\(', label: 'Legacy document.write() used', weight: 10 },
            { pattern: 'innerHTML', label: 'Unsafe innerHTML (XSS Risk)', weight: 15 },
            { pattern: 'chrome\\.tabs\\.executeScript', label: 'Dynamic Script Injection', weight: 20 },
            { pattern: 'chrome\\.cookies\\.getAll', label: 'Bulk Cookie Access', weight: 15 },
            { pattern: 'vkn-', label: 'Potential Obfuscated Code', weight: 15 },
            { pattern: '_0x[a-f0-9]+', label: 'Hex-Encoded Obfuscation', weight: 30 },
            { pattern: 'atob\\(', label: 'Base64 decoding (potential obfuscation)', weight: 10 },
            { pattern: 'crypto\\.subtle', label: 'Cryptographic operations', weight: 5 },
            { pattern: 'navigator\\.clipboard', label: 'Clipboard access', weight: 15 },
            { pattern: 'addEventListener.*keydown', label: 'Keyboard event listener (keylogging risk)', weight: 20 },
            { pattern: 'addEventListener.*keypress', label: 'Keypress monitoring', weight: 20 },
            { pattern: 'addEventListener.*input', label: 'Input field monitoring', weight: 15 },
            { pattern: 'addEventListener.*paste', label: 'Paste event monitoring', weight: 10 },
            { pattern: 'localStorage\\.setItem', label: 'Sensitive data persistency', weight: 5 },
            { pattern: 'chrome\\.storage\\.sync', label: 'Data synchronization across devices', weight: 5 }
        ],
        secrets: [
            { pattern: /AIza[0-9A-Za-z-_]{35}/, label: 'Google API Key', weight: 40 },
            { pattern: /sk_[live|test]_[0-9a-zA-Z]{24}/, label: 'Stripe Secret Key', weight: 50 },
            { pattern: /sq0atp-[0-9A-Za-z-_]{22}/, label: 'Square Access Token', weight: 40 },
            { pattern: /amzn\.mws\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/, label: 'Amazon MWS Auth Token', weight: 40 },
            { pattern: /ghp_[0-9a-zA-Z]{36}/, label: 'GitHub Personal Access Token', weight: 50 },
            { pattern: /SG\.[0-9A-Za-z-_]{22}\.[0-9A-Za-z-_]{43}/, label: 'SendGrid API Key', weight: 40 },
            { pattern: /key-[0-9a-f]{32}/, label: 'Mailgun API Key', weight: 40 },
            { pattern: /AKIA[0-9A-Z]{16}/, label: 'AWS Access Key ID', weight: 30 },
            { pattern: /xox[baprs]-[0-9]{12}-[0-9]{12}-[a-zA-Z0-9]{24}/, label: 'Slack Token', weight: 50 },
            { pattern: /SK[0-9a-fA-F]{32}/, label: 'Twilio API Secret', weight: 40 },
            { pattern: /AAA[a-zA-Z0-9_-]{7}:[a-zA-Z0-9_-]{140}/, label: 'Firebase Server Key', weight: 40 },
            { pattern: /ey[a-zA-Z0-9]{20,}\.[a-zA-Z0-9._-]{20,}\.[a-zA-Z0-9._-]{20,}/, label: 'Potential JWT Token', weight: 25 },
            { pattern: /sk-ant-api03-[a-zA-Z0-9-_]{93}AA/, label: 'Anthropic API Key', weight: 50 },
            { pattern: /sk-[a-zA-Z0-9]{48}/, label: 'OpenAI API Key', weight: 50 },
            { pattern: /(?:api|access|auth|secret|key|token)[_-]?key['"]?\s*[:=]\s*['"]([a-zA-Z0-9]{16,128})['"]/i, label: 'Generic API Key Variable', weight: 30 },
            { pattern: /AIza[0-9A-Za-z\\-_]{35}/, label: 'Firebase/Google Key', weight: 40 },
            { pattern: /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/, label: 'UUID/GUID Key', weight: 10 },
            { pattern: /[a-zA-Z0-9]{40,}/, label: 'High-Entropy String', weight: 15 },
            { pattern: /HEROKU_API_KEY=[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}/, label: 'Heroku API Key', weight: 40 }
        ],
        network: [
            { pattern: 'fetch\\(', type: 'fetch' },
            { pattern: 'XMLHttpRequest', type: 'XHR' },
            { pattern: 'WebSocket', type: 'WebSocket' },
            { pattern: '\\.ajax\\(', type: 'AJAX' }
        ],
        storage: [
            { pattern: 'localStorage', type: 'localStorage' },
            { pattern: 'sessionStorage', type: 'sessionStorage' },
            { pattern: 'chrome\\.storage\\.local', type: 'chrome.storage.local' },
            { pattern: 'chrome\\.storage\\.sync', type: 'chrome.storage.sync' },
            { pattern: 'indexedDB', type: 'IndexedDB' }
        ],
        fingerprinting: [
            'navigator.userAgent',
            'navigator.platform',
            'screen.width',
            'screen.height',
            'navigator.plugins',
            'canvas.toDataURL',
            'AudioContext'
        ],
        obfuscation: [
            { pattern: /\[\s*(['"]?)\w+\1\s*,\s*(['"]?)\w+\2\s*,/, label: 'Array-based obfuscation' },
            { pattern: /function\(\w+,\w+\)\{return\s+\w+\^\w+\}/, label: 'XOR-based encryption' },
            { pattern: /\\x[0-9a-fA-F]{2}/, label: 'Hex encoding' }
        ]
    };

    let manifest: any = {};
    const manifestFile = files.find(f => f.name.toLowerCase() === 'manifest.json');
    if (manifestFile && manifestFile.content) {
        try {
            manifest = JSON.parse(manifestFile.content);
        } catch (e) { }
    }

    // 1. Manifest Intelligence & Permission Analysis
    if (manifest) {
        const perms = (manifest.permissions || []).concat(manifest.host_permissions || []);

        // Categorize permissions
        const dangerousPerms = ['<all_urls>', '*://*/*', 'webRequest', 'webRequestBlocking', 'cookies', 'downloads', 'management', 'debugger'];
        const moderatePerms = ['tabs', 'history', 'bookmarks', 'topSites', 'webNavigation'];

        perms.forEach((perm: string) => {
            if (dangerousPerms.some(dp => perm.includes(dp))) {
                permissionCategories.dangerous.push(perm);
            } else if (moderatePerms.some(mp => perm.includes(mp))) {
                permissionCategories.moderate.push(perm);
            } else {
                permissionCategories.safe.push(perm);
            }
        });

        // Broad Host Permissions
        if (perms.includes('<all_urls>') || perms.includes('*://*/*')) {
            findings.push('Access to data on ALL websites');
            riskScore += 25;
            issues++;
        }

        // Networking + Blocking
        if (perms.includes('webRequest') && perms.includes('webRequestBlocking')) {
            findings.push('Can intercept and modify network requests');
            riskScore += 20;
            issues++;
        }

        // Remote Code
        if (manifest.content_security_policy) {
            const csp = typeof manifest.content_security_policy === 'string'
                ? manifest.content_security_policy
                : (manifest.content_security_policy.extension_pages || '');

            if (csp.includes("'unsafe-eval'") || csp.includes('unsafe-eval')) {
                findings.push('CSP allows unsafe code execution');
                riskScore += 20;
                issues++;
            }
        }

        // Check for background scripts/service workers
        if (manifest.background) {
            if (manifest.background.service_worker) {
                backgroundBehaviors.push('Uses Service Worker (Manifest V3)');
            }
            if (manifest.background.scripts) {
                backgroundBehaviors.push(`Background scripts: ${manifest.background.scripts.join(', ')}`);
            }
        }

        // Check content scripts
        if (manifest.content_scripts) {
            manifest.content_scripts.forEach((cs: any) => {
                const matches = cs.matches || [];
                const runAt = cs.run_at || 'document_idle';
                contentScriptBehaviors.push(`Runs on: ${matches.join(', ')} (${runAt})`);
            });
        }
    }

    // 2. Deep Code Scanning
    const traverse = (nodes: ExtractedFile[]) => {
        for (const node of nodes) {
            if (node.type === 'file' && node.content) {
                const ext = node.name.split('.').pop()?.toLowerCase();
                const content = node.content;

                // Count file types
                if (ext === 'js') totalJsFiles++;
                else if (ext === 'css') totalCssFiles++;
                else if (ext === 'html') totalHtmlFiles++;
                else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext || '')) totalAssets++;

                // Skip images/binary
                if (content.startsWith('data:image') || content === '[Binary Data]') {
                    if (node.children) traverse(node.children);
                    continue;
                }

                // Check for obfuscation patterns
                signatures.obfuscation.forEach(sig => {
                    if (sig.pattern.test(content)) {
                        if (!suspiciousPatterns.includes(sig.label)) {
                            suspiciousPatterns.push(sig.label);
                            riskScore += 15;
                        }
                    }
                });

                // Check for secrets
                signatures.secrets.forEach(sig => {
                    // Skip metadata files for secret scanning to avoid false positives in signed manifests
                    if (node.path.startsWith('_metadata/')) return;

                    const lines = content.split('\n');
                    lines.forEach((line, index) => {
                        // Filter out common false positives like chrome API calls and standard imports
                        const isCommonCode = /chrome\.|require\(|import\s|from\s|console\./i.test(line);

                        // Special handling for "High-Entropy String" to be more selective
                        if (sig.label === 'High-Entropy String') {
                            if (isCommonCode || line.length > 2000) return; // Skip code-heavy lines and massive minified lines
                        }

                        if (sig.pattern.test(line)) {
                            // double check if it's truly a secret and not just a long variable name
                            const match = line.match(sig.pattern);
                            if (match && match[0].length < 15 && sig.label === 'High-Entropy String') return;

                            secretFindings.push({
                                label: sig.label,
                                file: node.path,
                                line: index + 1,
                                snippet: line.trim()
                            });
                            findings.push(`CRITICAL: ${sig.label} detected in ${node.name} (Line ${index + 1})`);
                            riskScore += sig.weight;
                            issues++;
                        }
                    });
                });

                // Dependency detection
                const depPatterns = [
                    { name: 'jQuery', pattern: /jquery/i },
                    { name: 'React', pattern: /react/i },
                    { name: 'Vue', pattern: /vue/i },
                    { name: 'Angular', pattern: /angular/i },
                    { name: 'Axios', pattern: /axios/i },
                    { name: 'Lodash', pattern: /lodash/i },
                    { name: 'Moment', pattern: /moment/i },
                    { name: 'CryptoJS', pattern: /crypto-js/i },
                    { name: 'Web3', pattern: /web3/i },
                    { name: 'Ethers', pattern: /ethers/i }
                ];

                depPatterns.forEach(dep => {
                    if (content.includes(dep.name.toLowerCase()) || dep.pattern.test(content)) {
                        // Optional: track dependencies
                    }
                });

                // Check for minification/obfuscation
                const lines = content.split('\n');
                const avgLineLength = content.length / lines.length;

                if (avgLineLength > 500 || lines.some(l => l.length > 5000)) {
                    minifiedFiles++;
                    if (!findings.includes('Heavily minified/obfuscated code logic')) {
                        findings.push('Heavily minified/obfuscated code logic');
                        riskScore += 10;
                    }
                }

                // Check for obfuscation patterns (Legacy/Standard)
                if (/_0x[a-f0-9]+/.test(content) || /var\s+_0x/.test(content)) {
                    if (!obfuscatedFiles) obfuscatedFiles = 0;
                    obfuscatedFiles++;
                    if (!suspiciousPatterns.includes('Hex-encoded variable names')) {
                        suspiciousPatterns.push('Hex-encoded variable names');
                        riskScore += 15;
                    }
                }

                // Check Trackers
                signatures.trackers.forEach(tracker => {
                    if (content.includes(tracker.pattern) && !trackers.includes(tracker.name)) {
                        trackers.push(tracker.name);
                        riskScore += 5;
                    }
                });

                // Extract domains
                const urlRegex = /https?:\/\/([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
                const matches = content.matchAll(urlRegex);
                for (const match of matches) {
                    domains.add(match[1]);
                }

                // Check network requests
                signatures.network.forEach(net => {
                    if (new RegExp(net.pattern).test(content)) {
                        networkRequests.push({ type: net.type, url: node.path, file: node.name });
                    }
                });

                // Check storage usage
                signatures.storage.forEach(storage => {
                    if (content.includes(storage.pattern)) {
                        storageUsage.push({ type: storage.type, file: node.name });
                    }
                });

                // Check fingerprinting
                signatures.fingerprinting.forEach(fp => {
                    if (content.includes(fp) && !suspiciousPatterns.includes(`Fingerprinting: ${fp}`)) {
                        suspiciousPatterns.push(`Fingerprinting: ${fp}`);
                        riskScore += 8;
                    }
                });

                // Check Dangerous Patterns
                signatures.dangerous.forEach(sig => {
                    const regex = new RegExp(sig.pattern);
                    if (regex.test(content)) {
                        if (!findings.includes(sig.label)) {
                            findings.push(sig.label);
                            riskScore += sig.weight;
                            issues++;
                        }
                    }
                });
            }
            if (node.children) traverse(node.children);
        }
    };

    traverse(files);

    if (trackers.length > 0) {
        findings.push(`Contains tracking libraries: ${trackers.join(', ')}`);
        issues++;
    }

    // Cap risk score
    riskScore = Math.min(riskScore, 100);

    return {
        issues,
        riskScore,
        findings,
        trackers,
        domains: Array.from(domains),
        secretFindings,
        networkRequests,
        storageUsage,
        contentScriptBehaviors,
        backgroundBehaviors,
        suspiciousPatterns,
        permissionCategories,
        codeQuality: {
            minifiedFiles,
            obfuscatedFiles,
            totalJsFiles,
            totalCssFiles,
            totalHtmlFiles,
            totalAssets,
            obfuscationScore: Math.min((obfuscatedFiles / Math.max(totalJsFiles, 1)) * 100, 100),
            minificationRate: Math.min((minifiedFiles / Math.max(totalJsFiles, 1)) * 100, 100)
        }
    };
}

export function generateSmartInsights(audit: any) {
    const insights: Array<{ title: string; description: string; impact: 'critical' | 'warning' | 'info' }> = [];

    // 1. Correlate Permissions + Network
    const hasBroadHosts = audit.findings.some((f: string) => f.includes('ALL websites'));
    const hasNetwork = audit.networkRequests.length > 0;
    if (hasBroadHosts && hasNetwork) {
        insights.push({
            title: 'Exfiltration Pathway Detected',
            description: 'This extension has the capability to read data from any website and communicate with external servers. This is a high-risk pattern for data theft.',
            impact: 'critical'
        });
    }

    // 2. Correlate Permissions + Storage + Cookies
    const hasCookies = audit.findings.some((f: string) => f.includes('Cookie'));
    const hasTabs = audit.findings.some((f: string) => f.includes('tabs'));
    if (hasCookies && hasTabs) {
        insights.push({
            title: 'Session Hijacking Capability',
            description: 'By combining Cookie access with Tab monitoring, the extension could potentially hijack active user sessions or steal authentication tokens.',
            impact: 'critical'
        });
    }

    // 3. Obfuscation Reasoning
    if (audit.codeQuality.obfuscationScore > 20) {
        insights.push({
            title: 'Deliberate Logic Masking',
            description: `Approximately ${audit.codeQuality.obfuscationScore.toFixed(1)}% of the logic uses hex-encoding or obfuscation. This is often used to hide malicious payload delivery from automated scanners.`,
            impact: 'warning'
        });
    }

    // 4. Secrets Impact
    if (audit.secretFindings.length > 0) {
        insights.push({
            title: 'Developer Credential Leak',
            description: 'Hardcoded secrets found in the source code. These could be exploited by third parties to gain access to the developer\'s cloud infrastructure or APIs.',
            impact: 'critical'
        });
    }

    // 5. MV3 Status
    if (audit.backgroundBehaviors.some((b: string) => b.includes('V3'))) {
        insights.push({
            title: 'Modern Architecture',
            description: 'Uses Manifest V3 (Service Workers). This is the current security standard for Chrome extensions, offering better performance and restricted background execution.',
            impact: 'info'
        });
    }

    // Default if clean
    if (insights.length === 0) {
        insights.push({
            title: 'System Baseline: Clean',
            description: 'No cross-correlated risk patterns identified. The extension follows standard architectural paradigms for its stated permission set.',
            impact: 'info'
        });
    }

    return insights;
}

export function resolveExtensionName(manifest: any, files: ExtractedFile[]): string {
    let name = manifest.name || 'Unknown Extension';

    // Handle __MSG_name__ format
    if (name.startsWith('__MSG_') && name.endsWith('__')) {
        const key = name.substring(6, name.length - 2);
        const defaultLocale = manifest.default_locale || 'en';

        // Try to find the messages.json file for the locale
        const localeFile = files.find(f =>
            f.path.toLowerCase() === `_locales/${defaultLocale}/messages.json` ||
            f.path.toLowerCase() === `_locales/en/messages.json` ||
            f.path.toLowerCase() === `_locales/en_us/messages.json`
        );

        if (localeFile && localeFile.content && typeof localeFile.content === 'string') {
            try {
                const messages = JSON.parse(localeFile.content);
                if (messages[key] && messages[key].message) {
                    return messages[key].message;
                }
            } catch (e) {
                // Failed to parse locale file
            }
        }
    }

    return name;
}

// License Detection
export function detectLicense(files: ExtractedFile[]): { type: string; confidence: string; file?: string } {
    const licensePatterns = [
        { pattern: /MIT License/i, type: 'MIT', keywords: ['MIT', 'Permission is hereby granted'] },
        { pattern: /Apache License/i, type: 'Apache 2.0', keywords: ['Apache', 'Version 2.0'] },
        { pattern: /GNU GENERAL PUBLIC LICENSE/i, type: 'GPL', keywords: ['GPL', 'GNU GENERAL PUBLIC'] },
        { pattern: /BSD.*License/i, type: 'BSD', keywords: ['BSD', 'Redistribution and use'] },
        { pattern: /Mozilla Public License/i, type: 'MPL', keywords: ['Mozilla Public License'] },
        { pattern: /ISC License/i, type: 'ISC', keywords: ['ISC', 'Permission to use, copy, modify'] }
    ];

    // Check for LICENSE file
    const licenseFile = files.find(f =>
        /^LICENSE(\.txt|\.md)?$/i.test(f.name) ||
        /^COPYING$/i.test(f.name)
    );

    if (licenseFile && licenseFile.content && typeof licenseFile.content === 'string') {
        for (const { pattern, type, keywords } of licensePatterns) {
            if (pattern.test(licenseFile.content)) {
                const matchCount = keywords.filter(kw => licenseFile.content?.includes(kw)).length;
                const confidence = matchCount >= 2 ? 'High' : 'Medium';
                return { type, confidence, file: licenseFile.name };
            }
        }
        return { type: 'Custom/Proprietary', confidence: 'Medium', file: licenseFile.name };
    }

    // Check in package.json or manifest
    const packageFile = files.find(f => f.name === 'package.json');
    if (packageFile && packageFile.content) {
        try {
            const pkg = JSON.parse(packageFile.content);
            if (pkg.license) {
                return { type: pkg.license, confidence: 'High', file: 'package.json' };
            }
        } catch (e) { }
    }

    return { type: 'No License Found', confidence: 'N/A' };
}

// File Structure Analysis
export function analyzeFileStructure(files: ExtractedFile[]) {
    const structure = {
        backgroundScripts: [] as string[],
        contentScripts: [] as string[],
        injectedScripts: [] as string[],
        serviceWorkers: [] as string[],
        htmlPages: [] as string[],
        cssFiles: [] as string[],
        assets: [] as string[],
        configs: [] as string[]
    };

    const traverse = (nodes: ExtractedFile[], currentPath = '') => {
        for (const node of nodes) {
            if (node.type === 'file') {
                const ext = node.name.split('.').pop()?.toLowerCase();
                const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;

                if (node.name.includes('background') && ext === 'js') {
                    structure.backgroundScripts.push(fullPath);
                } else if (node.name.includes('content') && ext === 'js') {
                    structure.contentScripts.push(fullPath);
                } else if (node.name.includes('inject') && ext === 'js') {
                    structure.injectedScripts.push(fullPath);
                } else if (node.name.includes('service') && node.name.includes('worker')) {
                    structure.serviceWorkers.push(fullPath);
                } else if (ext === 'html') {
                    structure.htmlPages.push(fullPath);
                } else if (ext === 'css') {
                    structure.cssFiles.push(fullPath);
                } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext || '')) {
                    structure.assets.push(fullPath);
                } else if (['json', 'yml', 'yaml', 'xml'].includes(ext || '')) {
                    structure.configs.push(fullPath);
                }
            }
            if (node.children) {
                traverse(node.children, currentPath ? `${currentPath}/${node.name}` : node.name);
            }
        }
    };

    traverse(files);
    return structure;
}

// Generate permission explanations
export function explainPermission(permission: string): { description: string; risk: 'low' | 'medium' | 'high' } {
    const explanations: Record<string, { description: string; risk: 'low' | 'medium' | 'high' }> = {
        '<all_urls>': { description: 'Can read and modify data on all websites you visit', risk: 'high' },
        'tabs': { description: 'Can see URLs and titles of open tabs', risk: 'medium' },
        'activeTab': { description: 'Can access the current tab when you click the extension', risk: 'low' },
        'storage': { description: 'Can store data locally on your device', risk: 'low' },
        'cookies': { description: 'Can read and modify cookies', risk: 'high' },
        'history': { description: 'Can read your browsing history', risk: 'high' },
        'bookmarks': { description: 'Can read and modify your bookmarks', risk: 'medium' },
        'webRequest': { description: 'Can monitor network requests', risk: 'medium' },
        'webRequestBlocking': { description: 'Can block or modify network requests', risk: 'high' },
        'downloads': { description: 'Can manage your downloads', risk: 'medium' },
        'clipboardWrite': { description: 'Can write to your clipboard', risk: 'low' },
        'clipboardRead': { description: 'Can read from your clipboard', risk: 'high' },
        'geolocation': { description: 'Can access your location', risk: 'high' },
        'notifications': { description: 'Can show notifications', risk: 'low' },
        'contextMenus': { description: 'Can add items to right-click menus', risk: 'low' }
    };

    // Check for URL patterns
    if (permission.startsWith('http://') || permission.startsWith('https://') || permission.startsWith('*://')) {
        return { description: `Can access data on ${permission}`, risk: 'medium' };
    }

    return explanations[permission] || { description: permission, risk: 'low' };
}
