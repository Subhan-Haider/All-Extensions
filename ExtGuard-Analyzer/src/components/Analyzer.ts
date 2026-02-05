import JSZip from 'jszip';

export interface AuditResult {
    file: string;
    line?: number;
    type: 'error' | 'warning' | 'info';
    message: string;
    codeSnippet?: string;
}

export interface AuditReport {
    fileName: string;
    results: AuditResult[];
    timestamp: string;
    score: number;
}

export async function auditExtension(file: File): Promise<AuditReport> {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    const results: AuditResult[] = [];

    let totalChecks = 0;
    let passedChecks = 0;

    // 1. Manifest Audit
    const manifestFile = contents.file('manifest.json');
    if (!manifestFile) {
        results.push({
            file: 'manifest.json',
            type: 'error',
            message: 'Critical: manifest.json not found in root.'
        });
    } else {
        try {
            const manifestText = await manifestFile.async('text');
            const manifest = JSON.parse(manifestText);

            // Check version
            if (manifest.manifest_version !== 3) {
                results.push({
                    file: 'manifest.json',
                    type: 'warning',
                    message: 'Manifest V2 is deprecated. Consider upgrading to V3.'
                });
            }

            // Check dangerous permissions
            const dangerousPerms = ['<all_urls>', 'webRequestBlocking', 'debugger'];
            const foundPerms = (manifest.permissions || []).concat(manifest.host_permissions || []);

            foundPerms.forEach((p: string) => {
                if (dangerousPerms.includes(p)) {
                    results.push({
                        file: 'manifest.json',
                        type: 'warning',
                        message: `High privilege permission requested: ${p}`
                    });
                }
            });

        } catch (e) {
            results.push({
                file: 'manifest.json',
                type: 'error',
                message: 'Invalid manifest.json format (Parse error).'
            });
        }
    }

    // 2. Code Audit (Simple Static Analysis)
    for (const filename of Object.keys(contents.files)) {
        if (filename.endsWith('.js') || filename.endsWith('.ts')) {
            const content = await contents.files[filename].async('text');
            const lines = content.split('\n');

            lines.forEach((line, index) => {
                // eval check
                if (line.includes('eval(')) {
                    results.push({
                        file: filename,
                        line: index + 1,
                        type: 'error',
                        message: 'Avoid using eval() as it poses a significant security risk.',
                        codeSnippet: line.trim()
                    });
                }

                // innerHTML check
                if (line.includes('.innerHTML')) {
                    results.push({
                        file: filename,
                        line: index + 1,
                        type: 'warning',
                        message: 'Using innerHTML can lead to XSS. Use textContent or DOM APIs instead.',
                        codeSnippet: line.trim()
                    });
                }

                // storage check
                if (line.includes('chrome.storage.local')) {
                    // info
                }
            });
        }
    }

    // Calculate score
    const errors = results.filter(r => r.type === 'error').length;
    const warnings = results.filter(r => r.type === 'warning').length;
    const score = Math.max(0, 100 - (errors * 20) - (warnings * 5));

    return {
        fileName: file.name,
        results,
        timestamp: new Date().toISOString(),
        score
    };
}
