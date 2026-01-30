import { NodeType } from './constants';
export declare function debug(str: string): void;
export type StateMachine = {
    nodes: Array<Node>;
};
export type TokenBase = {
    segmentIndex: number;
};
export type PathToken = TokenBase & {
    type: `path`;
    slice?: undefined;
};
export type PositionalToken = TokenBase & {
    type: `positional`;
    slice?: undefined;
};
export type OptionToken = TokenBase & {
    type: `option`;
    slice?: [number, number];
    option: string;
};
export type AssignToken = TokenBase & {
    type: `assign`;
    slice: [number, number];
};
export type ValueToken = TokenBase & {
    type: `value`;
    slice?: [number, number];
};
export type Token = PathToken | PositionalToken | OptionToken | AssignToken | ValueToken;
export type RunState = {
    candidateUsage: string | null;
    requiredOptions: Array<Array<string>>;
    errorMessage: string | null;
    ignoreOptions: boolean;
    options: Array<{
        name: string;
        value: any;
    }>;
    path: Array<string>;
    positionals: Array<{
        value: string;
        extra: boolean | typeof NoLimits;
    }>;
    remainder: string | null;
    selectedIndex: number | null;
    tokens: Array<Token>;
};
export declare function makeStateMachine(): StateMachine;
export declare function makeAnyOfMachine(inputs: Array<StateMachine>): StateMachine;
export declare function injectNode(machine: StateMachine, node: Node): number;
export declare function simplifyMachine(input: StateMachine): void;
export declare function debugMachine(machine: StateMachine, { prefix }?: {
    prefix?: string;
}): void;
export declare function runMachineInternal(machine: StateMachine, input: Array<string>, partial?: boolean): {
    node: number;
    state: RunState;
}[];
export declare function trimSmallerBranches(branches: Array<{
    node: number;
    state: RunState;
}>): {
    node: number;
    state: RunState;
}[];
export declare function selectBestState(input: Array<string>, states: Array<RunState>): RunState;
export declare function aggregateHelpStates(states: Array<RunState>): RunState[];
type Transition = {
    to: number;
    reducer?: Callback<keyof typeof reducers, typeof reducers>;
};
type Node = {
    dynamics: Array<[Callback<keyof typeof tests, typeof tests>, Transition]>;
    shortcuts: Array<Transition>;
    statics: {
        [segment: string]: Array<Transition>;
    };
};
export declare function makeNode(): Node;
export declare function isTerminalNode(node: number): boolean;
export declare function cloneTransition(input: Transition, offset?: number): {
    to: number;
    reducer: "setCandidateState" | "setSelectedIndex" | "pushBatch" | "pushBound" | "pushPath" | "pushPositional" | "pushExtra" | "pushExtraNoLimits" | "pushTrue" | "pushFalse" | "pushUndefined" | "pushStringValue" | "setStringValue" | "inhibateOptions" | "useHelp" | "setError" | "setOptionArityError" | ["setCandidateState" | "setSelectedIndex" | "pushBatch" | "pushBound" | "pushPath" | "pushPositional" | "pushExtra" | "pushExtraNoLimits" | "pushTrue" | "pushFalse" | "pushUndefined" | "pushStringValue" | "setStringValue" | "inhibateOptions" | "useHelp" | "setError" | "setOptionArityError"] | ["setCandidateState" | "setSelectedIndex" | "pushBatch" | "pushBound" | "pushPath" | "pushPositional" | "pushExtra" | "pushExtraNoLimits" | "pushTrue" | "pushFalse" | "pushUndefined" | "pushStringValue" | "setStringValue" | "inhibateOptions" | "useHelp" | "setError" | "setOptionArityError", candidateState: Partial<RunState>] | ["setCandidateState" | "setSelectedIndex" | "pushBatch" | "pushBound" | "pushPath" | "pushPositional" | "pushExtra" | "pushExtraNoLimits" | "pushTrue" | "pushFalse" | "pushUndefined" | "pushStringValue" | "setStringValue" | "inhibateOptions" | "useHelp" | "setError" | "setOptionArityError", index: number] | ["setCandidateState" | "setSelectedIndex" | "pushBatch" | "pushBound" | "pushPath" | "pushPositional" | "pushExtra" | "pushExtraNoLimits" | "pushTrue" | "pushFalse" | "pushUndefined" | "pushStringValue" | "setStringValue" | "inhibateOptions" | "useHelp" | "setError" | "setOptionArityError", names: Map<string, string>] | ["setCandidateState" | "setSelectedIndex" | "pushBatch" | "pushBound" | "pushPath" | "pushPositional" | "pushExtra" | "pushExtraNoLimits" | "pushTrue" | "pushFalse" | "pushUndefined" | "pushStringValue" | "setStringValue" | "inhibateOptions" | "useHelp" | "setError" | "setOptionArityError", name: string] | ["setCandidateState" | "setSelectedIndex" | "pushBatch" | "pushBound" | "pushPath" | "pushPositional" | "pushExtra" | "pushExtraNoLimits" | "pushTrue" | "pushFalse" | "pushUndefined" | "pushStringValue" | "setStringValue" | "inhibateOptions" | "useHelp" | "setError" | "setOptionArityError", name: string] | ["setCandidateState" | "setSelectedIndex" | "pushBatch" | "pushBound" | "pushPath" | "pushPositional" | "pushExtra" | "pushExtraNoLimits" | "pushTrue" | "pushFalse" | "pushUndefined" | "pushStringValue" | "setStringValue" | "inhibateOptions" | "useHelp" | "setError" | "setOptionArityError", name: string] | ["setCandidateState" | "setSelectedIndex" | "pushBatch" | "pushBound" | "pushPath" | "pushPositional" | "pushExtra" | "pushExtraNoLimits" | "pushTrue" | "pushFalse" | "pushUndefined" | "pushStringValue" | "setStringValue" | "inhibateOptions" | "useHelp" | "setError" | "setOptionArityError", command: number] | ["setCandidateState" | "setSelectedIndex" | "pushBatch" | "pushBound" | "pushPath" | "pushPositional" | "pushExtra" | "pushExtraNoLimits" | "pushTrue" | "pushFalse" | "pushUndefined" | "pushStringValue" | "setStringValue" | "inhibateOptions" | "useHelp" | "setError" | "setOptionArityError", errorMessage: string] | undefined;
};
export declare function cloneNode(input: Node, offset?: number): Node;
export declare function registerDynamic<T extends keyof typeof tests, R extends keyof typeof reducers>(machine: StateMachine, from: NodeType | number, test: Callback<T, typeof tests>, to: NodeType | number, reducer?: Callback<R, typeof reducers>): void;
export declare function registerShortcut<R extends keyof typeof reducers>(machine: StateMachine, from: NodeType | number, to: NodeType | number, reducer?: Callback<R, typeof reducers>): void;
export declare function registerStatic<R extends keyof typeof reducers>(machine: StateMachine, from: NodeType | number, test: string, to: NodeType | number, reducer?: Callback<R, typeof reducers>): void;
type UndefinedKeys<T> = {
    [P in keyof T]-?: undefined extends T[P] ? P : never;
}[keyof T];
type UndefinedTupleKeys<T extends Array<unknown>> = UndefinedKeys<Omit<T, keyof []>>;
type TupleKeys<T> = Exclude<keyof T, keyof []>;
export type CallbackFn<P extends Array<any>, R> = (state: RunState, segment: string, segmentIndex: number, ...args: P) => R;
export type CallbackFnParameters<T extends CallbackFn<any, any>> = T extends ((state: RunState, segment: string, segmentIndex: number, ...args: infer P) => any) ? P : never;
export type CallbackStore<T extends string, R> = Record<T, CallbackFn<any, R>>;
export type Callback<T extends string, S extends CallbackStore<T, any>> = [
    TupleKeys<CallbackFnParameters<S[T]>>
] extends [UndefinedTupleKeys<CallbackFnParameters<S[T]>>] ? (T | [T, ...CallbackFnParameters<S[T]>]) : [T, ...CallbackFnParameters<S[T]>];
export declare function execute<T extends string, R, S extends CallbackStore<T, R>>(store: S, callback: Callback<T, S>, state: RunState, segment: string, segmentIndex: number): R;
export declare const tests: {
    always: () => boolean;
    isOptionLike: (state: RunState, segment: string) => boolean;
    isNotOptionLike: (state: RunState, segment: string) => boolean;
    isOption: (state: RunState, segment: string, segmentIndex: number, name: string) => boolean;
    isBatchOption: (state: RunState, segment: string, segmentIndex: number, names: Map<string, string>) => boolean;
    isBoundOption: (state: RunState, segment: string, segmentIndex: number, names: Map<string, string>, options: Array<OptDefinition>) => boolean;
    isNegatedOption: (state: RunState, segment: string, segmentIndex: number, name: string) => boolean;
    isHelp: (state: RunState, segment: string) => boolean;
    isUnsupportedOption: (state: RunState, segment: string, segmentIndex: number, names: Map<string, string>) => boolean;
    isInvalidOption: (state: RunState, segment: string) => boolean;
};
export declare const reducers: {
    setCandidateState: (state: RunState, segment: string, segmentIndex: number, candidateState: Partial<RunState>) => {
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        ignoreOptions: boolean;
        options: Array<{
            name: string;
            value: any;
        }>;
        path: Array<string>;
        positionals: Array<{
            value: string;
            extra: boolean | typeof NoLimits;
        }>;
        remainder: string | null;
        selectedIndex: number | null;
        tokens: Array<Token>;
    };
    setSelectedIndex: (state: RunState, segment: string, segmentIndex: number, index: number) => {
        selectedIndex: number;
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        ignoreOptions: boolean;
        options: Array<{
            name: string;
            value: any;
        }>;
        path: Array<string>;
        positionals: Array<{
            value: string;
            extra: boolean | typeof NoLimits;
        }>;
        remainder: string | null;
        tokens: Array<Token>;
    };
    pushBatch: (state: RunState, segment: string, segmentIndex: number, names: Map<string, string>) => {
        options: {
            name: string;
            value: any;
        }[];
        tokens: Token[];
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: Array<string>;
        positionals: Array<{
            value: string;
            extra: boolean | typeof NoLimits;
        }>;
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushBound: (state: RunState, segment: string, segmentIndex: number) => {
        options: {
            name: string;
            value: any;
        }[];
        tokens: Token[];
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: Array<string>;
        positionals: Array<{
            value: string;
            extra: boolean | typeof NoLimits;
        }>;
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushPath: (state: RunState, segment: string, segmentIndex: number) => {
        path: string[];
        tokens: Token[];
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        ignoreOptions: boolean;
        options: Array<{
            name: string;
            value: any;
        }>;
        positionals: Array<{
            value: string;
            extra: boolean | typeof NoLimits;
        }>;
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushPositional: (state: RunState, segment: string, segmentIndex: number) => {
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        tokens: Token[];
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        ignoreOptions: boolean;
        options: Array<{
            name: string;
            value: any;
        }>;
        path: Array<string>;
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushExtra: (state: RunState, segment: string, segmentIndex: number) => {
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        tokens: Token[];
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        ignoreOptions: boolean;
        options: Array<{
            name: string;
            value: any;
        }>;
        path: Array<string>;
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushExtraNoLimits: (state: RunState, segment: string, segmentIndex: number) => {
        positionals: {
            value: string;
            extra: boolean | typeof NoLimits;
        }[];
        tokens: Token[];
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        ignoreOptions: boolean;
        options: Array<{
            name: string;
            value: any;
        }>;
        path: Array<string>;
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushTrue: (state: RunState, segment: string, segmentIndex: number, name: string) => {
        options: {
            name: string;
            value: any;
        }[];
        tokens: Token[];
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: Array<string>;
        positionals: Array<{
            value: string;
            extra: boolean | typeof NoLimits;
        }>;
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushFalse: (state: RunState, segment: string, segmentIndex: number, name: string) => {
        options: {
            name: string;
            value: any;
        }[];
        tokens: Token[];
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: Array<string>;
        positionals: Array<{
            value: string;
            extra: boolean | typeof NoLimits;
        }>;
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushUndefined: (state: RunState, segment: string, segmentIndex: number, name: string) => {
        options: {
            name: string;
            value: any;
        }[];
        tokens: Token[];
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: Array<string>;
        positionals: Array<{
            value: string;
            extra: boolean | typeof NoLimits;
        }>;
        remainder: string | null;
        selectedIndex: number | null;
    };
    pushStringValue: (state: RunState, segment: string, segmentIndex: number) => {
        options: {
            name: string;
            value: any;
        }[];
        tokens: Token[];
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: Array<string>;
        positionals: Array<{
            value: string;
            extra: boolean | typeof NoLimits;
        }>;
        remainder: string | null;
        selectedIndex: number | null;
    };
    setStringValue: (state: RunState, segment: string, segmentIndex: number) => {
        options: {
            name: string;
            value: any;
        }[];
        tokens: Token[];
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: Array<string>;
        positionals: Array<{
            value: string;
            extra: boolean | typeof NoLimits;
        }>;
        remainder: string | null;
        selectedIndex: number | null;
    };
    inhibateOptions: (state: RunState) => {
        ignoreOptions: boolean;
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        options: Array<{
            name: string;
            value: any;
        }>;
        path: Array<string>;
        positionals: Array<{
            value: string;
            extra: boolean | typeof NoLimits;
        }>;
        remainder: string | null;
        selectedIndex: number | null;
        tokens: Array<Token>;
    };
    useHelp: (state: RunState, segment: string, segmentIndex: number, command: number) => {
        options: {
            name: string;
            value: string;
        }[];
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        errorMessage: string | null;
        ignoreOptions: boolean;
        path: Array<string>;
        positionals: Array<{
            value: string;
            extra: boolean | typeof NoLimits;
        }>;
        remainder: string | null;
        selectedIndex: number | null;
        tokens: Array<Token>;
    };
    setError: (state: RunState, segment: string, segmentIndex: number, errorMessage: string) => {
        errorMessage: string;
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        ignoreOptions: boolean;
        options: Array<{
            name: string;
            value: any;
        }>;
        path: Array<string>;
        positionals: Array<{
            value: string;
            extra: boolean | typeof NoLimits;
        }>;
        remainder: string | null;
        selectedIndex: number | null;
        tokens: Array<Token>;
    };
    setOptionArityError: (state: RunState, segment: string) => {
        errorMessage: string;
        candidateUsage: string | null;
        requiredOptions: Array<Array<string>>;
        ignoreOptions: boolean;
        options: Array<{
            name: string;
            value: any;
        }>;
        path: Array<string>;
        positionals: Array<{
            value: string;
            extra: boolean | typeof NoLimits;
        }>;
        remainder: string | null;
        selectedIndex: number | null;
        tokens: Array<Token>;
    };
};
export declare const NoLimits: unique symbol;
export type ArityDefinition = {
    leading: Array<string>;
    extra: Array<string> | typeof NoLimits;
    trailing: Array<string>;
    proxy: boolean;
};
export type OptDefinition = {
    preferredName: string;
    nameSet: Array<string>;
    description?: string;
    arity: number;
    hidden: boolean;
    required: boolean;
    allowBinding: boolean;
};
export declare class CommandBuilder<Context> {
    readonly cliIndex: number;
    readonly cliOpts: Readonly<CliOptions>;
    readonly allOptionNames: Map<string, string>;
    readonly arity: ArityDefinition;
    readonly options: Array<OptDefinition>;
    readonly paths: Array<Array<string>>;
    private context?;
    constructor(cliIndex: number, cliOpts: CliOptions);
    addPath(path: Array<string>): void;
    setArity({ leading, trailing, extra, proxy }: Partial<ArityDefinition>): void;
    addPositional({ name, required }?: {
        name?: string;
        required?: boolean;
    }): void;
    addRest({ name, required }?: {
        name?: string;
        required?: number;
    }): void;
    addProxy({ required }?: {
        name?: string;
        required?: number;
    }): void;
    addOption({ names: nameSet, description, arity, hidden, required, allowBinding }: Partial<OptDefinition> & {
        names: Array<string>;
    }): void;
    setContext(context: Context): void;
    usage({ detailed, inlineOptions }?: {
        detailed?: boolean;
        inlineOptions?: boolean;
    }): {
        usage: string;
        options: {
            preferredName: string;
            nameSet: Array<string>;
            definition: string;
            description: string;
            required: boolean;
        }[];
    };
    compile(): {
        machine: StateMachine;
        context: Context & ({} | null);
    };
    private registerOptions;
}
export type CliOptions = {
    binaryName: string;
};
export type CliBuilderCallback<Context> = (command: CommandBuilder<Context>) => CommandBuilder<Context> | void;
export declare class CliBuilder<Context> {
    private readonly opts;
    private readonly builders;
    static build<Context>(cbs: Array<CliBuilderCallback<Context>>, opts?: Partial<CliOptions>): {
        machine: StateMachine;
        contexts: ((Context & null) | (Context & {}))[];
        process: (input: string[], { partial }?: {
            partial?: boolean | undefined;
        }) => RunState;
    };
    constructor({ binaryName }?: Partial<CliOptions>);
    getBuilderByIndex(n: number): CommandBuilder<Context>;
    commands(cbs: Array<CliBuilderCallback<Context>>): this;
    command(): CommandBuilder<Context>;
    compile(): {
        machine: StateMachine;
        contexts: ((Context & null) | (Context & {}))[];
        process: (input: Array<string>, { partial }?: {
            partial?: boolean | undefined;
        }) => RunState;
    };
}
export {};
