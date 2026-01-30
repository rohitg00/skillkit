import { B as BaseCoverageOptions, a as ResolvedCoverageOptions } from './reporters-w_64AS5f.js';
import 'vite';
import '@vitest/runner';
import 'vite-node';
import '@vitest/snapshot';
import '@vitest/expect';
import '@vitest/runner/utils';
import '@vitest/utils';
import 'tinybench';
import 'node:stream';
import 'vite-node/client';
import '@vitest/snapshot/manager';
import 'vite-node/server';
import 'node:worker_threads';
import 'node:fs';
import 'chai';

interface CoverageSummaryData {
    lines: Totals;
    statements: Totals;
    branches: Totals;
    functions: Totals;
}

declare class CoverageSummary {
    constructor(data: CoverageSummary | CoverageSummaryData);
    merge(obj: CoverageSummary): CoverageSummary;
    toJSON(): CoverageSummaryData;
    isEmpty(): boolean;
    data: CoverageSummaryData;
    lines: Totals;
    statements: Totals;
    branches: Totals;
    functions: Totals;
}

interface CoverageMapData {
    [key: string]: FileCoverage | FileCoverageData;
}

declare class CoverageMap {
    constructor(data: CoverageMapData | CoverageMap);
    addFileCoverage(pathOrObject: string | FileCoverage | FileCoverageData): void;
    files(): string[];
    fileCoverageFor(filename: string): FileCoverage;
    filter(callback: (key: string) => boolean): void;
    getCoverageSummary(): CoverageSummary;
    merge(data: CoverageMapData | CoverageMap): void;
    toJSON(): CoverageMapData;
    data: CoverageMapData;
}

interface Location {
    line: number;
    column: number;
}

interface Range {
    start: Location;
    end: Location;
}

interface BranchMapping {
    loc: Range;
    type: string;
    locations: Range[];
    line: number;
}

interface FunctionMapping {
    name: string;
    decl: Range;
    loc: Range;
    line: number;
}

interface FileCoverageData {
    path: string;
    statementMap: { [key: string]: Range };
    fnMap: { [key: string]: FunctionMapping };
    branchMap: { [key: string]: BranchMapping };
    s: { [key: string]: number };
    f: { [key: string]: number };
    b: { [key: string]: number[] };
}

interface Totals {
    total: number;
    covered: number;
    skipped: number;
    pct: number;
}

interface Coverage {
    covered: number;
    total: number;
    coverage: number;
}

declare class FileCoverage implements FileCoverageData {
    constructor(data: string | FileCoverage | FileCoverageData);
    merge(other: FileCoverageData): void;
    getBranchCoverageByLine(): { [line: number]: Coverage };
    getLineCoverage(): { [line: number]: number };
    getUncoveredLines(): number[];
    resetHits(): void;
    computeBranchTotals(): Totals;
    computeSimpleTotals(): Totals;
    toSummary(): CoverageSummary;
    toJSON(): object;

    data: FileCoverageData;
    path: string;
    statementMap: { [key: string]: Range };
    fnMap: { [key: string]: FunctionMapping };
    branchMap: { [key: string]: BranchMapping };
    s: { [key: string]: number };
    f: { [key: string]: number };
    b: { [key: string]: number[] };
}

type Threshold = 'lines' | 'functions' | 'statements' | 'branches';
interface ResolvedThreshold {
    coverageMap: CoverageMap;
    name: string;
    thresholds: Partial<Record<Threshold, number | undefined>>;
}
declare class BaseCoverageProvider {
    /**
     * Check if current coverage is above configured thresholds and bump the thresholds if needed
     */
    updateThresholds({ thresholds: allThresholds, perFile, configurationFile, onUpdate }: {
        thresholds: ResolvedThreshold[];
        perFile?: boolean;
        configurationFile: unknown;
        onUpdate: () => void;
    }): void;
    /**
     * Check collected coverage against configured thresholds. Sets exit code to 1 when thresholds not reached.
     */
    checkThresholds({ thresholds: allThresholds, perFile }: {
        thresholds: ResolvedThreshold[];
        perFile?: boolean;
    }): void;
    /**
     * Constructs collected coverage and users' threshold options into separate sets
     * where each threshold set holds their own coverage maps. Threshold set is either
     * for specific files defined by glob pattern or global for all other files.
     */
    resolveThresholds({ coverageMap, thresholds, createCoverageMap, root }: {
        coverageMap: CoverageMap;
        thresholds: NonNullable<BaseCoverageOptions['thresholds']>;
        createCoverageMap: () => CoverageMap;
        root: string;
    }): ResolvedThreshold[];
    /**
     * Resolve reporters from various configuration options
     */
    resolveReporters(configReporters: NonNullable<BaseCoverageOptions['reporter']>): ResolvedCoverageOptions['reporter'];
    hasTerminalReporter(reporters: ResolvedCoverageOptions['reporter']): boolean;
    toSlices<T>(array: T[], size: number): T[][];
}

export { BaseCoverageProvider };
