'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var constants = require('./constants.js');
var errors = require('./errors.js');

// ------------------------------------------------------------------------
function debug(str) {
    if (constants.IS_DEBUG) {
        console.log(str);
    }
}
const basicHelpState = {
    candidateUsage: null,
    requiredOptions: [],
    errorMessage: null,
    ignoreOptions: false,
    path: [],
    positionals: [],
    options: [],
    remainder: null,
    selectedIndex: constants.HELP_COMMAND_INDEX,
    tokens: [],
};
function makeStateMachine() {
    const stateMachine = {
        nodes: [],
    };
    for (let t = 0; t < constants.NodeType.CustomNode; ++t)
        stateMachine.nodes.push(makeNode());
    return stateMachine;
}
function makeAnyOfMachine(inputs) {
    const output = makeStateMachine();
    const heads = [];
    let offset = output.nodes.length;
    for (const input of inputs) {
        heads.push(offset);
        for (let t = 0; t < input.nodes.length; ++t)
            if (!isTerminalNode(t))
                output.nodes.push(cloneNode(input.nodes[t], offset));
        offset += input.nodes.length - constants.NodeType.CustomNode + 1;
    }
    for (const head of heads)
        registerShortcut(output, constants.NodeType.InitialNode, head);
    return output;
}
function injectNode(machine, node) {
    machine.nodes.push(node);
    return machine.nodes.length - 1;
}
function simplifyMachine(input) {
    const visited = new Set();
    const process = (node) => {
        if (visited.has(node))
            return;
        visited.add(node);
        const nodeDef = input.nodes[node];
        for (const transitions of Object.values(nodeDef.statics))
            for (const { to } of transitions)
                process(to);
        for (const [, { to }] of nodeDef.dynamics)
            process(to);
        for (const { to } of nodeDef.shortcuts)
            process(to);
        const shortcuts = new Set(nodeDef.shortcuts.map(({ to }) => to));
        while (nodeDef.shortcuts.length > 0) {
            const { to } = nodeDef.shortcuts.shift();
            const toDef = input.nodes[to];
            for (const [segment, transitions] of Object.entries(toDef.statics)) {
                const store = !Object.prototype.hasOwnProperty.call(nodeDef.statics, segment)
                    ? nodeDef.statics[segment] = []
                    : nodeDef.statics[segment];
                for (const transition of transitions) {
                    if (!store.some(({ to }) => transition.to === to)) {
                        store.push(transition);
                    }
                }
            }
            for (const [test, transition] of toDef.dynamics)
                if (!nodeDef.dynamics.some(([otherTest, { to }]) => test === otherTest && transition.to === to))
                    nodeDef.dynamics.push([test, transition]);
            for (const transition of toDef.shortcuts) {
                if (!shortcuts.has(transition.to)) {
                    nodeDef.shortcuts.push(transition);
                    shortcuts.add(transition.to);
                }
            }
        }
    };
    process(constants.NodeType.InitialNode);
}
function debugMachine(machine, { prefix = `` } = {}) {
    // Don't iterate unless it's needed
    if (constants.IS_DEBUG) {
        debug(`${prefix}Nodes are:`);
        for (let t = 0; t < machine.nodes.length; ++t) {
            debug(`${prefix}  ${t}: ${JSON.stringify(machine.nodes[t])}`);
        }
    }
}
function runMachineInternal(machine, input, partial = false) {
    debug(`Running a vm on ${JSON.stringify(input)}`);
    let branches = [{
            node: constants.NodeType.InitialNode,
            state: {
                candidateUsage: null,
                requiredOptions: [],
                errorMessage: null,
                ignoreOptions: false,
                options: [],
                path: [],
                positionals: [],
                remainder: null,
                selectedIndex: null,
                tokens: [],
            },
        }];
    debugMachine(machine, { prefix: `  ` });
    const tokens = [constants.SpecialToken.StartOfInput, ...input];
    for (let t = 0; t < tokens.length; ++t) {
        const segment = tokens[t];
        const isEOI = segment === constants.SpecialToken.EndOfInput || segment === constants.SpecialToken.EndOfPartialInput;
        // The -1 is because we added a START_OF_INPUT token
        const segmentIndex = t - 1;
        debug(`  Processing ${JSON.stringify(segment)}`);
        const nextBranches = [];
        for (const { node, state } of branches) {
            debug(`    Current node is ${node}`);
            const nodeDef = machine.nodes[node];
            if (node === constants.NodeType.ErrorNode) {
                nextBranches.push({ node, state });
                continue;
            }
            console.assert(nodeDef.shortcuts.length === 0, `Shortcuts should have been eliminated by now`);
            const hasExactMatch = Object.prototype.hasOwnProperty.call(nodeDef.statics, segment);
            if (!partial || t < tokens.length - 1 || hasExactMatch) {
                if (hasExactMatch) {
                    const transitions = nodeDef.statics[segment];
                    for (const { to, reducer } of transitions) {
                        nextBranches.push({ node: to, state: typeof reducer !== `undefined` ? execute(reducers, reducer, state, segment, segmentIndex) : state });
                        debug(`      Static transition to ${to} found`);
                    }
                }
                else {
                    debug(`      No static transition found`);
                }
            }
            else {
                let hasMatches = false;
                for (const candidate of Object.keys(nodeDef.statics)) {
                    if (!candidate.startsWith(segment))
                        continue;
                    if (segment === candidate) {
                        for (const { to, reducer } of nodeDef.statics[candidate]) {
                            nextBranches.push({ node: to, state: typeof reducer !== `undefined` ? execute(reducers, reducer, state, segment, segmentIndex) : state });
                            debug(`      Static transition to ${to} found`);
                        }
                    }
                    else {
                        for (const { to } of nodeDef.statics[candidate]) {
                            nextBranches.push({ node: to, state: { ...state, remainder: candidate.slice(segment.length) } });
                            debug(`      Static transition to ${to} found (partial match)`);
                        }
                    }
                    hasMatches = true;
                }
                if (!hasMatches) {
                    debug(`      No partial static transition found`);
                }
            }
            if (!isEOI) {
                for (const [test, { to, reducer }] of nodeDef.dynamics) {
                    if (execute(tests, test, state, segment, segmentIndex)) {
                        nextBranches.push({ node: to, state: typeof reducer !== `undefined` ? execute(reducers, reducer, state, segment, segmentIndex) : state });
                        debug(`      Dynamic transition to ${to} found (via ${test})`);
                    }
                }
            }
        }
        if (nextBranches.length === 0 && isEOI && input.length === 1) {
            return [{
                    node: constants.NodeType.InitialNode,
                    state: basicHelpState,
                }];
        }
        if (nextBranches.length === 0) {
            throw new errors.UnknownSyntaxError(input, branches.filter(({ node }) => {
                return node !== constants.NodeType.ErrorNode;
            }).map(({ state }) => {
                return { usage: state.candidateUsage, reason: null };
            }));
        }
        if (nextBranches.every(({ node }) => node === constants.NodeType.ErrorNode)) {
            throw new errors.UnknownSyntaxError(input, nextBranches.map(({ state }) => {
                return { usage: state.candidateUsage, reason: state.errorMessage };
            }));
        }
        branches = trimSmallerBranches(nextBranches);
    }
    if (branches.length > 0) {
        debug(`  Results:`);
        for (const branch of branches) {
            debug(`    - ${branch.node} -> ${JSON.stringify(branch.state)}`);
        }
    }
    else {
        debug(`  No results`);
    }
    return branches;
}
function runMachine(machine, input, { endToken = constants.SpecialToken.EndOfInput } = {}) {
    const branches = runMachineInternal(machine, [...input, endToken]);
    return selectBestState(input, branches.map(({ state }) => {
        return state;
    }));
}
function trimSmallerBranches(branches) {
    let maxPathSize = 0;
    for (const { state } of branches)
        if (state.path.length > maxPathSize)
            maxPathSize = state.path.length;
    return branches.filter(({ state }) => {
        return state.path.length === maxPathSize;
    });
}
function selectBestState(input, states) {
    const terminalStates = states.filter(state => {
        return state.selectedIndex !== null;
    });
    if (terminalStates.length === 0)
        throw new Error();
    const requiredOptionsSetStates = terminalStates.filter(state => state.selectedIndex === constants.HELP_COMMAND_INDEX || state.requiredOptions.every(names => names.some(name => state.options.find(opt => opt.name === name))));
    if (requiredOptionsSetStates.length === 0) {
        throw new errors.UnknownSyntaxError(input, terminalStates.map(state => ({
            usage: state.candidateUsage,
            reason: null,
        })));
    }
    let maxPathSize = 0;
    for (const state of requiredOptionsSetStates)
        if (state.path.length > maxPathSize)
            maxPathSize = state.path.length;
    const bestPathBranches = requiredOptionsSetStates.filter(state => {
        return state.path.length === maxPathSize;
    });
    const getPositionalCount = (state) => state.positionals.filter(({ extra }) => {
        return !extra;
    }).length + state.options.length;
    const statesWithPositionalCount = bestPathBranches.map(state => {
        return { state, positionalCount: getPositionalCount(state) };
    });
    let maxPositionalCount = 0;
    for (const { positionalCount } of statesWithPositionalCount)
        if (positionalCount > maxPositionalCount)
            maxPositionalCount = positionalCount;
    const bestPositionalStates = statesWithPositionalCount.filter(({ positionalCount }) => {
        return positionalCount === maxPositionalCount;
    }).map(({ state }) => {
        return state;
    });
    const fixedStates = aggregateHelpStates(bestPositionalStates);
    if (fixedStates.length > 1)
        throw new errors.AmbiguousSyntaxError(input, fixedStates.map(state => state.candidateUsage));
    return fixedStates[0];
}
function aggregateHelpStates(states) {
    const notHelps = [];
    const helps = [];
    for (const state of states) {
        if (state.selectedIndex === constants.HELP_COMMAND_INDEX) {
            helps.push(state);
        }
        else {
            notHelps.push(state);
        }
    }
    if (helps.length > 0) {
        notHelps.push({
            ...basicHelpState,
            path: findCommonPrefix(...helps.map(state => state.path)),
            options: helps.reduce((options, state) => options.concat(state.options), []),
        });
    }
    return notHelps;
}
function findCommonPrefix(firstPath, secondPath, ...rest) {
    if (secondPath === undefined)
        return Array.from(firstPath);
    return findCommonPrefix(firstPath.filter((segment, i) => segment === secondPath[i]), ...rest);
}
function makeNode() {
    return {
        dynamics: [],
        shortcuts: [],
        statics: {},
    };
}
function isTerminalNode(node) {
    return node === constants.NodeType.SuccessNode || node === constants.NodeType.ErrorNode;
}
function cloneTransition(input, offset = 0) {
    const to = !isTerminalNode(input.to)
        ? input.to >= constants.NodeType.CustomNode
            ? input.to + offset - constants.NodeType.CustomNode + 1
            : input.to + offset
        : input.to;
    return {
        to,
        reducer: input.reducer,
    };
}
function cloneNode(input, offset = 0) {
    const output = makeNode();
    for (const [test, transition] of input.dynamics)
        output.dynamics.push([test, cloneTransition(transition, offset)]);
    for (const transition of input.shortcuts)
        output.shortcuts.push(cloneTransition(transition, offset));
    for (const [segment, transitions] of Object.entries(input.statics))
        output.statics[segment] = transitions.map(transition => cloneTransition(transition, offset));
    return output;
}
function registerDynamic(machine, from, test, to, reducer) {
    machine.nodes[from].dynamics.push([
        test,
        { to, reducer: reducer },
    ]);
}
function registerShortcut(machine, from, to, reducer) {
    machine.nodes[from].shortcuts.push({ to, reducer: reducer });
}
function registerStatic(machine, from, test, to, reducer) {
    const store = !Object.prototype.hasOwnProperty.call(machine.nodes[from].statics, test)
        ? machine.nodes[from].statics[test] = []
        : machine.nodes[from].statics[test];
    store.push({ to, reducer: reducer });
}
function execute(store, callback, state, segment, segmentIndex) {
    // TypeScript's control flow can't properly narrow
    // generic conditionals for some mysterious reason
    if (Array.isArray(callback)) {
        const [name, ...args] = callback;
        return store[name](state, segment, segmentIndex, ...args);
    }
    else {
        return store[callback](state, segment, segmentIndex);
    }
}
const tests = {
    always: () => {
        return true;
    },
    isOptionLike: (state, segment) => {
        return !state.ignoreOptions && (segment !== `-` && segment.startsWith(`-`));
    },
    isNotOptionLike: (state, segment) => {
        return state.ignoreOptions || segment === `-` || !segment.startsWith(`-`);
    },
    isOption: (state, segment, segmentIndex, name) => {
        return !state.ignoreOptions && segment === name;
    },
    isBatchOption: (state, segment, segmentIndex, names) => {
        return !state.ignoreOptions && constants.BATCH_REGEX.test(segment) && [...segment.slice(1)].every(name => names.has(`-${name}`));
    },
    isBoundOption: (state, segment, segmentIndex, names, options) => {
        const optionParsing = segment.match(constants.BINDING_REGEX);
        return !state.ignoreOptions && !!optionParsing && constants.OPTION_REGEX.test(optionParsing[1]) && names.has(optionParsing[1])
            // Disallow bound options with no arguments (i.e. booleans)
            && options.filter(opt => opt.nameSet.includes(optionParsing[1])).every(opt => opt.allowBinding);
    },
    isNegatedOption: (state, segment, segmentIndex, name) => {
        return !state.ignoreOptions && segment === `--no-${name.slice(2)}`;
    },
    isHelp: (state, segment) => {
        return !state.ignoreOptions && constants.HELP_REGEX.test(segment);
    },
    isUnsupportedOption: (state, segment, segmentIndex, names) => {
        return !state.ignoreOptions && segment.startsWith(`-`) && constants.OPTION_REGEX.test(segment) && !names.has(segment);
    },
    isInvalidOption: (state, segment) => {
        return !state.ignoreOptions && segment.startsWith(`-`) && !constants.OPTION_REGEX.test(segment);
    },
};
const reducers = {
    setCandidateState: (state, segment, segmentIndex, candidateState) => {
        return { ...state, ...candidateState };
    },
    setSelectedIndex: (state, segment, segmentIndex, index) => {
        return { ...state, selectedIndex: index };
    },
    pushBatch: (state, segment, segmentIndex, names) => {
        const options = state.options.slice();
        const tokens = state.tokens.slice();
        for (let t = 1; t < segment.length; ++t) {
            const name = names.get(`-${segment[t]}`);
            const slice = t === 1 ? [0, 2] : [t, t + 1];
            options.push({ name, value: true });
            tokens.push({ segmentIndex, type: `option`, option: name, slice });
        }
        return { ...state, options, tokens };
    },
    pushBound: (state, segment, segmentIndex) => {
        const [, name, value] = segment.match(constants.BINDING_REGEX);
        const options = state.options.concat({ name, value });
        const tokens = state.tokens.concat([
            { segmentIndex, type: `option`, slice: [0, name.length], option: name },
            { segmentIndex, type: `assign`, slice: [name.length, name.length + 1] },
            { segmentIndex, type: `value`, slice: [name.length + 1, name.length + value.length + 1] },
        ]);
        return { ...state, options, tokens };
    },
    pushPath: (state, segment, segmentIndex) => {
        const path = state.path.concat(segment);
        const tokens = state.tokens.concat({ segmentIndex, type: `path` });
        return { ...state, path, tokens };
    },
    pushPositional: (state, segment, segmentIndex) => {
        const positionals = state.positionals.concat({ value: segment, extra: false });
        const tokens = state.tokens.concat({ segmentIndex, type: `positional` });
        return { ...state, positionals, tokens };
    },
    pushExtra: (state, segment, segmentIndex) => {
        const positionals = state.positionals.concat({ value: segment, extra: true });
        const tokens = state.tokens.concat({ segmentIndex, type: `positional` });
        return { ...state, positionals, tokens };
    },
    pushExtraNoLimits: (state, segment, segmentIndex) => {
        const positionals = state.positionals.concat({ value: segment, extra: NoLimits });
        const tokens = state.tokens.concat({ segmentIndex, type: `positional` });
        return { ...state, positionals, tokens };
    },
    pushTrue: (state, segment, segmentIndex, name) => {
        const options = state.options.concat({ name, value: true });
        const tokens = state.tokens.concat({ segmentIndex, type: `option`, option: name });
        return { ...state, options, tokens };
    },
    pushFalse: (state, segment, segmentIndex, name) => {
        const options = state.options.concat({ name, value: false });
        const tokens = state.tokens.concat({ segmentIndex, type: `option`, option: name });
        return { ...state, options, tokens };
    },
    pushUndefined: (state, segment, segmentIndex, name) => {
        const options = state.options.concat({ name: segment, value: undefined });
        const tokens = state.tokens.concat({ segmentIndex, type: `option`, option: segment });
        return { ...state, options, tokens };
    },
    pushStringValue: (state, segment, segmentIndex) => {
        var _a;
        const lastOption = state.options[state.options.length - 1];
        const options = state.options.slice();
        const tokens = state.tokens.concat({ segmentIndex, type: `value` });
        lastOption.value = ((_a = lastOption.value) !== null && _a !== void 0 ? _a : []).concat([segment]);
        return { ...state, options, tokens };
    },
    setStringValue: (state, segment, segmentIndex) => {
        const lastOption = state.options[state.options.length - 1];
        const options = state.options.slice();
        const tokens = state.tokens.concat({ segmentIndex, type: `value` });
        lastOption.value = segment;
        return { ...state, options, tokens };
    },
    inhibateOptions: (state) => {
        return { ...state, ignoreOptions: true };
    },
    useHelp: (state, segment, segmentIndex, command) => {
        const [, /* name */ , index] = segment.match(constants.HELP_REGEX);
        if (typeof index !== `undefined`) {
            return { ...state, options: [{ name: `-c`, value: String(command) }, { name: `-i`, value: index }] };
        }
        else {
            return { ...state, options: [{ name: `-c`, value: String(command) }] };
        }
    },
    setError: (state, segment, segmentIndex, errorMessage) => {
        if (segment === constants.SpecialToken.EndOfInput || segment === constants.SpecialToken.EndOfPartialInput) {
            return { ...state, errorMessage: `${errorMessage}.` };
        }
        else {
            return { ...state, errorMessage: `${errorMessage} ("${segment}").` };
        }
    },
    setOptionArityError: (state, segment) => {
        const lastOption = state.options[state.options.length - 1];
        return { ...state, errorMessage: `Not enough arguments to option ${lastOption.name}.` };
    },
};
// ------------------------------------------------------------------------
const NoLimits = Symbol();
class CommandBuilder {
    constructor(cliIndex, cliOpts) {
        this.allOptionNames = new Map();
        this.arity = { leading: [], trailing: [], extra: [], proxy: false };
        this.options = [];
        this.paths = [];
        this.cliIndex = cliIndex;
        this.cliOpts = cliOpts;
    }
    addPath(path) {
        this.paths.push(path);
    }
    setArity({ leading = this.arity.leading, trailing = this.arity.trailing, extra = this.arity.extra, proxy = this.arity.proxy }) {
        Object.assign(this.arity, { leading, trailing, extra, proxy });
    }
    addPositional({ name = `arg`, required = true } = {}) {
        if (!required && this.arity.extra === NoLimits)
            throw new Error(`Optional parameters cannot be declared when using .rest() or .proxy()`);
        if (!required && this.arity.trailing.length > 0)
            throw new Error(`Optional parameters cannot be declared after the required trailing positional arguments`);
        if (!required && this.arity.extra !== NoLimits) {
            this.arity.extra.push(name);
        }
        else if (this.arity.extra !== NoLimits && this.arity.extra.length === 0) {
            this.arity.leading.push(name);
        }
        else {
            this.arity.trailing.push(name);
        }
    }
    addRest({ name = `arg`, required = 0 } = {}) {
        if (this.arity.extra === NoLimits)
            throw new Error(`Infinite lists cannot be declared multiple times in the same command`);
        if (this.arity.trailing.length > 0)
            throw new Error(`Infinite lists cannot be declared after the required trailing positional arguments`);
        for (let t = 0; t < required; ++t)
            this.addPositional({ name });
        this.arity.extra = NoLimits;
    }
    addProxy({ required = 0 } = {}) {
        this.addRest({ required });
        this.arity.proxy = true;
    }
    addOption({ names: nameSet, description, arity = 0, hidden = false, required = false, allowBinding = true }) {
        if (!allowBinding && arity > 1)
            throw new Error(`The arity cannot be higher than 1 when the option only supports the --arg=value syntax`);
        if (!Number.isInteger(arity))
            throw new Error(`The arity must be an integer, got ${arity}`);
        if (arity < 0)
            throw new Error(`The arity must be positive, got ${arity}`);
        const preferredName = nameSet.reduce((longestName, name) => {
            return name.length > longestName.length ? name : longestName;
        }, ``);
        for (const name of nameSet)
            this.allOptionNames.set(name, preferredName);
        this.options.push({ preferredName, nameSet, description, arity, hidden, required, allowBinding });
    }
    setContext(context) {
        this.context = context;
    }
    usage({ detailed = true, inlineOptions = true } = {}) {
        const segments = [this.cliOpts.binaryName];
        const detailedOptionList = [];
        if (this.paths.length > 0)
            segments.push(...this.paths[0]);
        if (detailed) {
            for (const { preferredName, nameSet, arity, hidden, description, required } of this.options) {
                if (hidden)
                    continue;
                const args = [];
                for (let t = 0; t < arity; ++t)
                    args.push(` #${t}`);
                const definition = `${nameSet.join(`,`)}${args.join(``)}`;
                if (!inlineOptions && description) {
                    detailedOptionList.push({ preferredName, nameSet, definition, description, required });
                }
                else {
                    segments.push(required ? `<${definition}>` : `[${definition}]`);
                }
            }
            segments.push(...this.arity.leading.map(name => `<${name}>`));
            if (this.arity.extra === NoLimits)
                segments.push(`...`);
            else
                segments.push(...this.arity.extra.map(name => `[${name}]`));
            segments.push(...this.arity.trailing.map(name => `<${name}>`));
        }
        const usage = segments.join(` `);
        return { usage, options: detailedOptionList };
    }
    compile() {
        if (typeof this.context === `undefined`)
            throw new Error(`Assertion failed: No context attached`);
        const machine = makeStateMachine();
        let firstNode = constants.NodeType.InitialNode;
        const candidateUsage = this.usage().usage;
        const requiredOptions = this.options
            .filter(opt => opt.required)
            .map(opt => opt.nameSet);
        firstNode = injectNode(machine, makeNode());
        registerStatic(machine, constants.NodeType.InitialNode, constants.SpecialToken.StartOfInput, firstNode, [`setCandidateState`, { candidateUsage, requiredOptions }]);
        const positionalArgument = this.arity.proxy
            ? `always`
            : `isNotOptionLike`;
        const paths = this.paths.length > 0
            ? this.paths
            : [[]];
        for (const path of paths) {
            let lastPathNode = firstNode;
            // We allow options to be specified before the path. Note that we
            // only do this when there is a path, otherwise there would be
            // some redundancy with the options attached later.
            if (path.length > 0) {
                const optionPathNode = injectNode(machine, makeNode());
                registerShortcut(machine, lastPathNode, optionPathNode);
                this.registerOptions(machine, optionPathNode);
                lastPathNode = optionPathNode;
            }
            for (let t = 0; t < path.length; ++t) {
                const nextPathNode = injectNode(machine, makeNode());
                registerStatic(machine, lastPathNode, path[t], nextPathNode, `pushPath`);
                lastPathNode = nextPathNode;
                if (t + 1 < path.length) {
                    // Allow to pass `-h` (without anything after it) after each part of a path.
                    // Note that we do not do this for the last part, otherwise there would be
                    // some redundancy with the `useHelp` attached later.
                    const helpNode = injectNode(machine, makeNode());
                    registerDynamic(machine, lastPathNode, `isHelp`, helpNode, [`useHelp`, this.cliIndex]);
                    registerStatic(machine, helpNode, constants.SpecialToken.EndOfInput, constants.NodeType.SuccessNode, [`setSelectedIndex`, constants.HELP_COMMAND_INDEX]);
                }
            }
            if (this.arity.leading.length > 0 || !this.arity.proxy) {
                const helpNode = injectNode(machine, makeNode());
                registerDynamic(machine, lastPathNode, `isHelp`, helpNode, [`useHelp`, this.cliIndex]);
                registerDynamic(machine, helpNode, `always`, helpNode, `pushExtra`);
                registerStatic(machine, helpNode, constants.SpecialToken.EndOfInput, constants.NodeType.SuccessNode, [`setSelectedIndex`, constants.HELP_COMMAND_INDEX]);
                this.registerOptions(machine, lastPathNode);
            }
            if (this.arity.leading.length > 0) {
                registerStatic(machine, lastPathNode, constants.SpecialToken.EndOfInput, constants.NodeType.ErrorNode, [`setError`, `Not enough positional arguments`]);
                registerStatic(machine, lastPathNode, constants.SpecialToken.EndOfPartialInput, constants.NodeType.SuccessNode, [`setSelectedIndex`, this.cliIndex]);
            }
            let lastLeadingNode = lastPathNode;
            for (let t = 0; t < this.arity.leading.length; ++t) {
                const nextLeadingNode = injectNode(machine, makeNode());
                if (!this.arity.proxy || t + 1 !== this.arity.leading.length)
                    this.registerOptions(machine, nextLeadingNode);
                if (this.arity.trailing.length > 0 || t + 1 !== this.arity.leading.length) {
                    registerStatic(machine, nextLeadingNode, constants.SpecialToken.EndOfInput, constants.NodeType.ErrorNode, [`setError`, `Not enough positional arguments`]);
                    registerStatic(machine, nextLeadingNode, constants.SpecialToken.EndOfPartialInput, constants.NodeType.SuccessNode, [`setSelectedIndex`, this.cliIndex]);
                }
                registerDynamic(machine, lastLeadingNode, `isNotOptionLike`, nextLeadingNode, `pushPositional`);
                lastLeadingNode = nextLeadingNode;
            }
            let lastExtraNode = lastLeadingNode;
            if (this.arity.extra === NoLimits || this.arity.extra.length > 0) {
                const extraShortcutNode = injectNode(machine, makeNode());
                registerShortcut(machine, lastLeadingNode, extraShortcutNode);
                if (this.arity.extra === NoLimits) {
                    const extraNode = injectNode(machine, makeNode());
                    if (!this.arity.proxy)
                        this.registerOptions(machine, extraNode);
                    registerDynamic(machine, lastLeadingNode, positionalArgument, extraNode, `pushExtraNoLimits`);
                    registerDynamic(machine, extraNode, positionalArgument, extraNode, `pushExtraNoLimits`);
                    registerShortcut(machine, extraNode, extraShortcutNode);
                }
                else {
                    for (let t = 0; t < this.arity.extra.length; ++t) {
                        const nextExtraNode = injectNode(machine, makeNode());
                        if (!this.arity.proxy || t > 0)
                            this.registerOptions(machine, nextExtraNode);
                        registerDynamic(machine, lastExtraNode, positionalArgument, nextExtraNode, `pushExtra`);
                        registerShortcut(machine, nextExtraNode, extraShortcutNode);
                        lastExtraNode = nextExtraNode;
                    }
                }
                lastExtraNode = extraShortcutNode;
            }
            if (this.arity.trailing.length > 0) {
                registerStatic(machine, lastExtraNode, constants.SpecialToken.EndOfInput, constants.NodeType.ErrorNode, [`setError`, `Not enough positional arguments`]);
                registerStatic(machine, lastExtraNode, constants.SpecialToken.EndOfPartialInput, constants.NodeType.SuccessNode, [`setSelectedIndex`, this.cliIndex]);
            }
            let lastTrailingNode = lastExtraNode;
            for (let t = 0; t < this.arity.trailing.length; ++t) {
                const nextTrailingNode = injectNode(machine, makeNode());
                if (!this.arity.proxy)
                    this.registerOptions(machine, nextTrailingNode);
                if (t + 1 < this.arity.trailing.length) {
                    registerStatic(machine, nextTrailingNode, constants.SpecialToken.EndOfInput, constants.NodeType.ErrorNode, [`setError`, `Not enough positional arguments`]);
                    registerStatic(machine, nextTrailingNode, constants.SpecialToken.EndOfPartialInput, constants.NodeType.SuccessNode, [`setSelectedIndex`, this.cliIndex]);
                }
                registerDynamic(machine, lastTrailingNode, `isNotOptionLike`, nextTrailingNode, `pushPositional`);
                lastTrailingNode = nextTrailingNode;
            }
            registerDynamic(machine, lastTrailingNode, positionalArgument, constants.NodeType.ErrorNode, [`setError`, `Extraneous positional argument`]);
            registerStatic(machine, lastTrailingNode, constants.SpecialToken.EndOfInput, constants.NodeType.SuccessNode, [`setSelectedIndex`, this.cliIndex]);
            registerStatic(machine, lastTrailingNode, constants.SpecialToken.EndOfPartialInput, constants.NodeType.SuccessNode, [`setSelectedIndex`, this.cliIndex]);
        }
        return {
            machine,
            context: this.context,
        };
    }
    registerOptions(machine, node) {
        registerDynamic(machine, node, [`isOption`, `--`], node, `inhibateOptions`);
        registerDynamic(machine, node, [`isBatchOption`, this.allOptionNames], node, [`pushBatch`, this.allOptionNames]);
        registerDynamic(machine, node, [`isBoundOption`, this.allOptionNames, this.options], node, `pushBound`);
        registerDynamic(machine, node, [`isUnsupportedOption`, this.allOptionNames], constants.NodeType.ErrorNode, [`setError`, `Unsupported option name`]);
        registerDynamic(machine, node, [`isInvalidOption`], constants.NodeType.ErrorNode, [`setError`, `Invalid option name`]);
        for (const option of this.options) {
            if (option.arity === 0) {
                for (const name of option.nameSet) {
                    registerDynamic(machine, node, [`isOption`, name], node, [`pushTrue`, option.preferredName]);
                    if (name.startsWith(`--`) && !name.startsWith(`--no-`)) {
                        registerDynamic(machine, node, [`isNegatedOption`, name], node, [`pushFalse`, option.preferredName]);
                    }
                }
            }
            else {
                // We inject a new node at the end of the state machine
                let lastNode = injectNode(machine, makeNode());
                // We register transitions from the starting node to this new node
                for (const name of option.nameSet)
                    registerDynamic(machine, node, [`isOption`, name], lastNode, [`pushUndefined`, option.preferredName]);
                // For each argument, we inject a new node at the end and we
                // register a transition from the current node to this new node
                for (let t = 0; t < option.arity; ++t) {
                    const nextNode = injectNode(machine, makeNode());
                    // We can provide better errors when another option or EndOfInput is encountered
                    registerStatic(machine, lastNode, constants.SpecialToken.EndOfInput, constants.NodeType.ErrorNode, `setOptionArityError`);
                    registerStatic(machine, lastNode, constants.SpecialToken.EndOfPartialInput, constants.NodeType.ErrorNode, `setOptionArityError`);
                    registerDynamic(machine, lastNode, `isOptionLike`, constants.NodeType.ErrorNode, `setOptionArityError`);
                    // If the option has a single argument, no need to store it in an array
                    const action = option.arity === 1
                        ? `setStringValue`
                        : `pushStringValue`;
                    registerDynamic(machine, lastNode, `isNotOptionLike`, nextNode, action);
                    lastNode = nextNode;
                }
                // In the end, we register a shortcut from
                // the last node back to the starting node
                registerShortcut(machine, lastNode, node);
            }
        }
    }
}
class CliBuilder {
    static build(cbs, opts = {}) {
        return new CliBuilder(opts).commands(cbs).compile();
    }
    constructor({ binaryName = `...` } = {}) {
        this.builders = [];
        this.opts = { binaryName };
    }
    getBuilderByIndex(n) {
        if (!(n >= 0 && n < this.builders.length))
            throw new Error(`Assertion failed: Out-of-bound command index (${n})`);
        return this.builders[n];
    }
    commands(cbs) {
        for (const cb of cbs)
            cb(this.command());
        return this;
    }
    command() {
        const builder = new CommandBuilder(this.builders.length, this.opts);
        this.builders.push(builder);
        return builder;
    }
    compile() {
        const machines = [];
        const contexts = [];
        for (const builder of this.builders) {
            const { machine, context } = builder.compile();
            machines.push(machine);
            contexts.push(context);
        }
        const machine = makeAnyOfMachine(machines);
        simplifyMachine(machine);
        return {
            machine,
            contexts,
            process: (input, { partial } = {}) => {
                const endToken = partial
                    ? constants.SpecialToken.EndOfPartialInput
                    : constants.SpecialToken.EndOfInput;
                return runMachine(machine, input, { endToken });
            },
        };
    }
}

exports.CliBuilder = CliBuilder;
exports.CommandBuilder = CommandBuilder;
exports.NoLimits = NoLimits;
exports.aggregateHelpStates = aggregateHelpStates;
exports.cloneNode = cloneNode;
exports.cloneTransition = cloneTransition;
exports.debug = debug;
exports.debugMachine = debugMachine;
exports.execute = execute;
exports.injectNode = injectNode;
exports.isTerminalNode = isTerminalNode;
exports.makeAnyOfMachine = makeAnyOfMachine;
exports.makeNode = makeNode;
exports.makeStateMachine = makeStateMachine;
exports.reducers = reducers;
exports.registerDynamic = registerDynamic;
exports.registerShortcut = registerShortcut;
exports.registerStatic = registerStatic;
exports.runMachineInternal = runMachineInternal;
exports.selectBestState = selectBestState;
exports.simplifyMachine = simplifyMachine;
exports.tests = tests;
exports.trimSmallerBranches = trimSmallerBranches;
