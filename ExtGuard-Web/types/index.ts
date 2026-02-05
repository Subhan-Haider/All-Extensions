export type ExtensionType = 'Chrome' | 'MV2' | 'MV3' | 'Firefox' | 'Edge' | 'Unknown';
export type SubmissionStatus = 'draft' | 'pending' | 'reviewing' | 'approved' | 'rejected' | 'published';

export interface TestResult {
    id: string;
    name: string;
    category: 'Structure' | 'Manifest' | 'Code Quality' | 'Security' | 'Compliance' | 'Functional' | 'Performance';
    status: 'passed' | 'warning' | 'error';
    message: string;
    details?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface StoreStatus {
    status: 'passed' | 'warning' | 'error';
    riskScore: number;
}

export interface StoreReadiness {
    chrome: StoreStatus;
    firefox: StoreStatus;
    edge: StoreStatus;
    recommendations: string[];
}

export interface PerformanceMetrics {
    loadTime: number; // ms
    memoryEstimate: number; // KB
    cpuImpact: 'low' | 'medium' | 'high';
}

export interface AnalysisReport {
    id: string;
    extensionName: string;
    version: string;
    description?: string;
    type: ExtensionType;
    manifestVersion: number;
    results: TestResult[];
    readiness: StoreReadiness;
    performance: PerformanceMetrics;
    timestamp: string;
    privacyAutoPolicy?: string;
}

export interface Extension {
    id: string;
    name: string;
    developer: {
        name: string;
        id: string;
        verified: boolean;
    };
    currentVersion: string;
    status: SubmissionStatus;
    category: string;
    latestReport: AnalysisReport;
    downloads: number;
    updatedAt: string;
    iconUrl?: string;
    zipUrl: string;
}

export interface User {
    id: string;
    name: string;
    role: 'developer' | 'admin' | 'moderator';
    reputation: number;
}
