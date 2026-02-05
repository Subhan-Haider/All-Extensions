import AdmZip, { IZipEntry } from 'adm-zip';
import { AnalysisReport, TestResult, ExtensionType, StoreReadiness, PerformanceMetrics } from '../types';

export async function analyzeExtension(buffer: Buffer): Promise<AnalysisReport> {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    const results: TestResult[] = [];
    const id = Math.random().toString(36).substring(7);

    let manifest: any = null;
    // 1. Find the most likely manifest.json (handles zip-of-folder or root-of-zip)
    // We prioritize the manifest that is "shallowest" (closest to root) to avoid picking up nested ones in node_modules
    const candidates = zipEntries
        .filter((entry: IZipEntry) => entry.entryName.toLowerCase().endsWith('manifest.json') && !entry.isDirectory)
        .sort((a, b) => a.entryName.split('/').length - b.entryName.split('/').length);

    let manifestEntry = candidates[0];
    const rootPath = manifestEntry ? manifestEntry.entryName.replace(/manifest\.json/i, '') : '';

    // 1. Structure Checks
    if (zipEntries.length === 0) {
        results.push({
            id: 'zip-empty',
            name: 'ZIP Content Check',
            category: 'Structure',
            status: 'error',
            message: 'The ZIP file appears to be empty or corrupted.',
            severity: 'critical'
        });
        return generateErrorReport(results, id);
    }

    results.push({
        id: 'zip-integrity',
        name: 'ZIP Integrity Check',
        category: 'Structure',
        status: 'passed',
        message: `Valid ZIP structure. Found ${zipEntries.length} entries.`,
        severity: 'low'
    });

    if (!manifestEntry) {
        results.push({
            id: 'manifest-missing',
            name: 'Manifest Existence',
            category: 'Structure',
            status: 'error',
            message: 'Could not find manifest.json anywhere in the ZIP.',
            details: 'Ensure your extension contains a manifest.json file, and that it is not inside nested subfolders.',
            severity: 'critical'
        });
        return generateErrorReport(results, id);
    }

    try {
        const manifestText = zip.readAsText(manifestEntry);
        if (!manifestText || manifestText.trim() === '') {
            throw new Error('Manifest file is empty');
        }
        manifest = JSON.parse(manifestText);
    } catch (e: any) {
        results.push({
            id: 'manifest-json-err',
            name: 'Manifest Validity',
            category: 'Structure',
            status: 'error',
            message: `Invalid manifest.json: ${e.message}`,
            severity: 'critical'
        });
        return generateErrorReport(results, id);
    }

    // 2. Manifest Schema & Permissions
    const mv = manifest.manifest_version || 0;
    const name = manifest.name || 'Unknown Extension';
    const version = manifest.version || '0.0.0';

    if (mv < 3) {
        results.push({
            id: 'deprecated-mv',
            name: 'Manifest Version',
            category: 'Manifest',
            status: 'warning',
            message: `Manifest V${mv} is deprecated. Chrome will soon fully disable V2 extensions.`,
            severity: 'medium'
        });
    } else {
        results.push({
            id: 'mv3-check',
            name: 'Manifest Version',
            category: 'Manifest',
            status: 'passed',
            message: 'Manifest V3 detected.',
            severity: 'low'
        });
    }

    const perms = manifest.permissions || [];
    if (perms.includes('<all_urls>')) {
        results.push({
            id: 'broad-perms',
            name: 'Over-privileged Permissions',
            category: 'Security',
            status: 'error',
            message: 'Requested <all_urls>. This is a high-risk permission often used for data harvesting.',
            severity: 'high'
        });
    }

    // Detect background scripts / service workers
    const hasBackground = manifest.background?.scripts || manifest.background?.service_worker;
    results.push({
        id: 'entry-point',
        name: 'Background Logic',
        category: 'Structure',
        status: hasBackground ? 'passed' : 'warning',
        message: hasBackground ? 'Background scripts/worker found.' : 'No background logic detected.',
        severity: 'low'
    });

    // 3. Static Code Analysis
    let obfuscationDetected = false;
    let evalFiles: string[] = [];
    let totalJsSize = 0;
    let jsCount = 0;

    zipEntries.forEach((entry: IZipEntry) => {
        if (entry.entryName.startsWith(rootPath) && entry.entryName.toLowerCase().endsWith('.js')) {
            jsCount++;
            const code = zip.readAsText(entry);
            const lines = code.split('\n');
            totalJsSize += code.length;

            // eval search with line numbers
            lines.forEach((line, index) => {
                if (line.includes('eval(') || line.includes('new Function(')) {
                    evalFiles.push(`${entry.entryName} (Line ${index + 1})`);
                }
            });

            if ((code.match(/\\x[0-9a-f]{2}/g) || []).length > 20) {
                obfuscationDetected = true;
            }

            // Secret Detection with snippets
            const secretPatterns = {
                'Google API Key': /AIza[0-9A-Za-z\-_]{35}/,
                'AWS Access Key': /AKIA[0-9A-Z]{16}/,
                'Stripe Secret Key': /sk_live_[0-9a-zA-Z]{24}/,
            };

            for (const [sName, pattern] of Object.entries(secretPatterns)) {
                lines.forEach((line, index) => {
                    if (pattern.test(line)) {
                        results.push({
                            id: `secret-${sName}-${entry.entryName}-${index}`,
                            name: `Exposed ${sName}`,
                            category: 'Security',
                            status: 'error',
                            message: `Potential ${sName} found in ${entry.entryName} on line ${index + 1}.`,
                            details: `Snippet: ${line.trim().substring(0, 100)}...`,
                            severity: 'critical'
                        });
                    }
                });
            }
        }
    });

    if (evalFiles.length > 0) {
        results.push({
            id: 'eval-usage',
            name: 'Dynamic Code Execution',
            category: 'Code Quality',
            status: 'error',
            message: `Found eval/new Function in ${evalFiles.length} file(s).`,
            details: `Affected files: ${evalFiles.join(', ')}`,
            severity: 'high'
        });
    }

    if (obfuscationDetected) {
        results.push({
            id: 'obfuscation',
            name: 'Code Obfuscation',
            category: 'Security',
            status: 'error',
            message: 'High levels of string obfuscation detected. Typical sign of malware.',
            severity: 'critical'
        });
    }

    // 4. Determinstic Performance & Performance
    // Base load time on JS count/size, memory on total size
    const performance: PerformanceMetrics = {
        loadTime: Math.min(500, 30 + (jsCount * 15) + Math.floor(totalJsSize / 1024 / 2)),
        memoryEstimate: Math.floor(totalJsSize / 5) + (hasBackground ? 2000 : 500),
        cpuImpact: results.some(r => r.severity === 'critical') ? 'high' : (results.some(r => r.severity === 'high') ? 'medium' : 'low')
    };

    results.push({
        id: 'perf-check',
        name: 'Memory Impact',
        category: 'Performance',
        status: performance.memoryEstimate > 8000 ? 'error' : (performance.memoryEstimate > 3000 ? 'warning' : 'passed'),
        message: `Estimated memory usage: ${(performance.memoryEstimate / 1024).toFixed(2)}MB`,
        severity: 'low'
    });

    // 5. Store Readiness Calculation
    const totalRisk = results.reduce((acc, r) => {
        if (r.status === 'error') return acc + (r.severity === 'critical' ? 50 : 25);
        if (r.status === 'warning') return acc + 10;
        return acc;
    }, 0);

    const riskScore = Math.min(100, totalRisk);
    const getStatus = (score: number) => score >= 50 ? 'error' : (score >= 10 ? 'warning' : 'passed');

    // Logic fix: Status should be the WORST of (Risk Score status, MV version status)
    const mvStatus: 'passed' | 'warning' = mv < 3 ? 'warning' : 'passed';
    const calculatedStatus = getStatus(riskScore);

    const finalStatus = (calculatedStatus === 'error') ? 'error' :
        ((calculatedStatus === 'warning' || mvStatus === 'warning') ? 'warning' : 'passed');

    const readiness: StoreReadiness = {
        chrome: { status: finalStatus, riskScore },
        firefox: { status: calculatedStatus, riskScore }, // Firefox still accepts MV2
        edge: { status: finalStatus, riskScore },
        recommendations: []
    };

    if (evalFiles.length > 0) readiness.recommendations.push('Remove all eval() calls for Chrome Web Store compliance.');
    if (perms.includes('<all_urls>')) readiness.recommendations.push('Downscale host permissions to specific domains to avoid manual review delays.');
    if (mv < 3) readiness.recommendations.push('Upgrade to Manifest V3 to ensure longevity on Chrome and Edge.');

    return {
        id,
        extensionName: name,
        version: version,
        description: manifest.description || 'No description provided.',
        type: mv === 3 ? 'MV3' : (mv === 2 ? 'MV2' : 'Unknown'),
        manifestVersion: mv,
        results,
        readiness,
        performance,
        timestamp: new Date().toISOString(),
        privacyAutoPolicy: generatePrivacyPolicy(manifest, results)
    };
}

function generatePrivacyPolicy(manifest: any, results: TestResult[]): string {
    const perms = manifest.permissions || [];
    const collectsData = perms.some((p: string) => ['history', 'tabs', 'cookies', 'bookmarks'].includes(p));

    return `Privacy Policy for ${manifest.name || 'Extension'}
  
This extension respects your privacy. 
${collectsData ? `It may access your ${perms.filter((p: string) => ['history', 'tabs', 'cookies'].includes(p)).join(', ')} to provide its core functionality.` : 'It does not collect or transmit personal user data.'}
Data is processed locally on your device and is not sold to third parties.
Contact the developer at ${manifest.author || 'the support website'} for questions.`;
}

function generateErrorReport(results: TestResult[], id: string): AnalysisReport {
    return {
        id,
        extensionName: 'Analysis Failed',
        version: '0.0.0',
        type: 'Unknown',
        manifestVersion: 0,
        results,
        readiness: {
            chrome: { status: 'error', riskScore: 100 },
            firefox: { status: 'error', riskScore: 100 },
            edge: { status: 'error', riskScore: 100 },
            recommendations: ['Ensure your ZIP contains a valid manifest.json in the root directory.']
        },
        performance: { loadTime: 0, memoryEstimate: 0, cpuImpact: 'low' },
        timestamp: new Date().toISOString()
    };
}
