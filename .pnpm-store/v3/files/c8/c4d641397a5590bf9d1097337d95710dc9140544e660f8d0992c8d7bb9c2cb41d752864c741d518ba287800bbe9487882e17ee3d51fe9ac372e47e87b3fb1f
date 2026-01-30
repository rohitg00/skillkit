export const __esModule: boolean;
export type TreeEntry = {
    /**
     * - the 6 digit hexadecimal mode
     */
    mode: string;
    /**
     * - the name of the file or directory
     */
    path: string;
    /**
     * - the SHA-1 object id of the blob or tree
     */
    oid: string;
    /**
     * - the type of object
     */
    type: "commit" | "blob" | "tree";
};
export type GitProgressEvent = {
    phase: string;
    loaded: number;
    total: number;
};
export type ProgressCallback = (progress: GitProgressEvent) => void | Promise<void>;
export type GitHttpRequest = {
    /**
     * - The URL to request
     */
    url: string;
    /**
     * - The HTTP method to use
     */
    method?: string | undefined;
    /**
     * - Headers to include in the HTTP request
     */
    headers?: {
        [x: string]: string;
    } | undefined;
    /**
     * - An HTTP or HTTPS agent that manages connections for the HTTP client (Node.js only)
     */
    agent?: any;
    /**
     * - An async iterator of Uint8Arrays that make up the body of POST requests
     */
    body?: AsyncIterableIterator<Uint8Array>;
    /**
     * - Reserved for future use (emitting `GitProgressEvent`s)
     */
    onProgress?: ProgressCallback | undefined;
    /**
     * - Reserved for future use (canceling a request)
     */
    signal?: object;
};
export type GitHttpResponse = {
    /**
     * - The final URL that was fetched after any redirects
     */
    url: string;
    /**
     * - The HTTP method that was used
     */
    method?: string | undefined;
    /**
     * - HTTP response headers
     */
    headers?: {
        [x: string]: string;
    } | undefined;
    /**
     * - An async iterator of Uint8Arrays that make up the body of the response
     */
    body?: AsyncIterableIterator<Uint8Array>;
    /**
     * - The HTTP status code
     */
    statusCode: number;
    /**
     * - The HTTP status message
     */
    statusMessage: string;
};
export type HttpFetch = (request: GitHttpRequest) => Promise<GitHttpResponse>;
export type HttpClient = {
    request: HttpFetch;
};
/**
 * A git commit object.
 */
export type CommitObject = {
    /**
     * Commit message
     */
    message: string;
    /**
     * SHA-1 object id of corresponding file tree
     */
    tree: string;
    /**
     * an array of zero or more SHA-1 object ids
     */
    parent: string[];
    author: {
        name: string;
        email: string;
        timestamp: number;
        timezoneOffset: number;
    };
    committer: {
        name: string;
        email: string;
        timestamp: number;
        timezoneOffset: number;
    };
    /**
     * PGP signature (if present)
     */
    gpgsig?: string | undefined;
};
/**
 * A git tree object. Trees represent a directory snapshot.
 */
export type TreeObject = TreeEntry[];
/**
 * A git annotated tag object.
 */
export type TagObject = {
    /**
     * SHA-1 object id of object being tagged
     */
    object: string;
    /**
     * the type of the object being tagged
     */
    type: "blob" | "tree" | "commit" | "tag";
    /**
     * the tag name
     */
    tag: string;
    tagger: {
        name: string;
        email: string;
        timestamp: number;
        timezoneOffset: number;
    };
    /**
     * tag message
     */
    message: string;
    /**
     * PGP signature (if present)
     */
    gpgsig?: string | undefined;
};
export type ReadCommitResult = {
    /**
     * - SHA-1 object id of this commit
     */
    oid: string;
    /**
     * - the parsed commit object
     */
    commit: CommitObject;
    /**
     * - PGP signing payload
     */
    payload: string;
};
/**
 * - This object has the following schema:
 */
export type ServerRef = {
    /**
     * - The name of the ref
     */
    ref: string;
    /**
     * - The SHA-1 object id the ref points to
     */
    oid: string;
    /**
     * - The target ref pointed to by a symbolic ref
     */
    target?: string | undefined;
    /**
     * - If the oid is the SHA-1 object id of an annotated tag, this is the SHA-1 object id that the annotated tag points to
     */
    peeled?: string | undefined;
};
export type Walker = {
    /**
     * ('GitWalkerSymbol')
     */
    Symbol: Symbol;
};
/**
 * Normalized subset of filesystem `stat` data:
 */
export type Stat = {
    ctimeSeconds: number;
    ctimeNanoseconds: number;
    mtimeSeconds: number;
    mtimeNanoseconds: number;
    dev: number;
    ino: number;
    mode: number;
    uid: number;
    gid: number;
    size: number;
};
/**
 * The `WalkerEntry` is an interface that abstracts computing many common tree / blob stats.
 */
export type WalkerEntry = {
    type: () => Promise<"tree" | "blob" | "special" | "commit">;
    mode: () => Promise<number>;
    oid: () => Promise<string>;
    content: () => Promise<Uint8Array | void>;
    stat: () => Promise<Stat>;
};
export type CallbackFsClient = {
    /**
     * - https://nodejs.org/api/fs.html#fs_fs_readfile_path_options_callback
     */
    readFile: Function;
    /**
     * - https://nodejs.org/api/fs.html#fs_fs_writefile_file_data_options_callback
     */
    writeFile: Function;
    /**
     * - https://nodejs.org/api/fs.html#fs_fs_unlink_path_callback
     */
    unlink: Function;
    /**
     * - https://nodejs.org/api/fs.html#fs_fs_readdir_path_options_callback
     */
    readdir: Function;
    /**
     * - https://nodejs.org/api/fs.html#fs_fs_mkdir_path_mode_callback
     */
    mkdir: Function;
    /**
     * - https://nodejs.org/api/fs.html#fs_fs_rmdir_path_callback
     */
    rmdir: Function;
    /**
     * - https://nodejs.org/api/fs.html#fs_fs_stat_path_options_callback
     */
    stat: Function;
    /**
     * - https://nodejs.org/api/fs.html#fs_fs_lstat_path_options_callback
     */
    lstat: Function;
    /**
     * - https://nodejs.org/api/fs.html#fs_fs_readlink_path_options_callback
     */
    readlink?: Function | undefined;
    /**
     * - https://nodejs.org/api/fs.html#fs_fs_symlink_target_path_type_callback
     */
    symlink?: Function | undefined;
    /**
     * - https://nodejs.org/api/fs.html#fs_fs_chmod_path_mode_callback
     */
    chmod?: Function | undefined;
};
export type PromiseFsClient = {
    promises: {
        readFile: Function;
        writeFile: Function;
        unlink: Function;
        readdir: Function;
        mkdir: Function;
        rmdir: Function;
        stat: Function;
        lstat: Function;
        readlink?: Function | undefined;
        symlink?: Function | undefined;
        chmod?: Function | undefined;
    };
};
export type FsClient = CallbackFsClient | PromiseFsClient;
export type MessageCallback = (message: string) => void | Promise<void>;
export type GitAuth = {
    username?: string | undefined;
    password?: string | undefined;
    headers?: {
        [x: string]: string;
    } | undefined;
    /**
     * Tells git to throw a `UserCanceledError` (instead of an `HttpError`).
     */
    cancel?: boolean | undefined;
};
export type AuthCallback = (url: string, auth: GitAuth) => GitAuth | void | Promise<GitAuth | void>;
export type AuthFailureCallback = (url: string, auth: GitAuth) => GitAuth | void | Promise<GitAuth | void>;
export type AuthSuccessCallback = (url: string, auth: GitAuth) => void | Promise<void>;
export type SignParams = {
    /**
     * - a plaintext message
     */
    payload: string;
    /**
     * - an 'ASCII armor' encoded PGP key (technically can actually contain _multiple_ keys)
     */
    secretKey: string;
};
export type SignCallback = (args: SignParams) => {
    signature: string;
} | Promise<{
    signature: string;
}>;
export type MergeDriverParams = {
    branches: Array<string>;
    contents: Array<string>;
    path: string;
};
export type MergeDriverCallback = (args: MergeDriverParams) => {
    cleanMerge: boolean;
    mergedText: string;
} | Promise<{
    cleanMerge: boolean;
    mergedText: string;
}>;
export type WalkerMap = (filename: string, entries: WalkerEntry[]) => Promise<any>;
export type WalkerReduce = (parent: any, children: any[]) => Promise<any>;
export type WalkerIterateCallback = (entries: WalkerEntry[]) => Promise<any[]>;
export type WalkerIterate = (walk: WalkerIterateCallback, children: IterableIterator<WalkerEntry[]>) => Promise<any[]>;
export type RefUpdateStatus = {
    ok: boolean;
    error: string;
};
export type PushResult = {
    ok: boolean;
    error: string | null;
    refs: {
        [x: string]: RefUpdateStatus;
    };
    headers?: {
        [x: string]: string;
    } | undefined;
};
export type HeadStatus = 0 | 1;
export type WorkdirStatus = 0 | 1 | 2;
export type StageStatus = 0 | 1 | 2 | 3;
export type StatusRow = [string, HeadStatus, WorkdirStatus, StageStatus];
/**
 * the type of stash ops
 */
export type StashOp = "push" | "pop" | "apply" | "drop" | "list" | "clear";
/**
 * - when compare WORDIR to HEAD, 'remove' could mean 'untracked'
 */
export type StashChangeType = "equal" | "modify" | "add" | "remove" | "unknown";
export type ClientRef = {
    /**
     * The name of the ref
     */
    ref: string;
    /**
     * The SHA-1 object id the ref points to
     */
    oid: string;
};
export type PrePushParams = {
    /**
     * The expanded name of target remote
     */
    remote: string;
    /**
     * The URL address of target remote
     */
    url: string;
    /**
     * The ref which the client wants to push to the remote
     */
    localRef: ClientRef;
    /**
     * The ref which is known by the remote
     */
    remoteRef: ClientRef;
};
export type PrePushCallback = (args: PrePushParams) => boolean | Promise<boolean>;
export type PostCheckoutParams = {
    /**
     * The SHA-1 object id of HEAD before checkout
     */
    previousHead: string;
    /**
     * The SHA-1 object id of HEAD after checkout
     */
    newHead: string;
    /**
     * flag determining whether a branch or a set of files was checked
     */
    type: "branch" | "file";
};
export type PostCheckoutCallback = (args: PostCheckoutParams) => void | Promise<void>;
/**
 * Manages access to the Git configuration file, providing methods to read and save configurations.
 */
export class GitConfigManager {
    /**
     * Reads the Git configuration file from the specified `.git` directory.
     *
     * @param {object} opts - Options for reading the Git configuration.
     * @param {FSClient} opts.fs - A file system implementation.
     * @param {string} opts.gitdir - The path to the `.git` directory.
     * @returns {Promise<GitConfig>} A `GitConfig` object representing the parsed configuration.
     */
    static get({ fs, gitdir }: {
        fs: FSClient;
        gitdir: string;
    }): Promise<GitConfig>;
    /**
     * Saves the provided Git configuration to the specified `.git` directory.
     *
     * @param {object} opts - Options for saving the Git configuration.
     * @param {FSClient} opts.fs - A file system implementation.
     * @param {string} opts.gitdir - The path to the `.git` directory.
     * @param {GitConfig} opts.config - The `GitConfig` object to save.
     * @returns {Promise<void>} Resolves when the configuration has been successfully saved.
     */
    static save({ fs, gitdir, config }: {
        fs: FSClient;
        gitdir: string;
        config: GitConfig;
    }): Promise<void>;
}
export class GitIgnoreManager {
    /**
     * Determines whether a given file is ignored based on `.gitignore` rules and exclusion files.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} args.dir - The working directory.
     * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
     * @param {string} args.filepath - The path of the file to check.
     * @returns {Promise<boolean>} - `true` if the file is ignored, `false` otherwise.
     */
    static isIgnored({ fs, dir, gitdir, filepath }: {
        fs: FSClient;
        dir: string;
        gitdir?: string | undefined;
        filepath: string;
    }): Promise<boolean>;
}
export class GitIndexManager {
    /**
     * Manages access to the Git index file, ensuring thread-safe operations and caching.
     *
     * @param {object} opts - Options for acquiring the Git index.
     * @param {FSClient} opts.fs - A file system implementation.
     * @param {string} opts.gitdir - The path to the `.git` directory.
     * @param {object} opts.cache - A shared cache object for storing index data.
     * @param {boolean} [opts.allowUnmerged=true] - Whether to allow unmerged paths in the index.
     * @param {function(GitIndex): any} closure - A function to execute with the Git index.
     * @returns {Promise<any>} The result of the closure function.
     * @throws {UnmergedPathsError} If unmerged paths exist and `allowUnmerged` is `false`.
     */
    static acquire({ fs, gitdir, cache, allowUnmerged }: {
        fs: FSClient;
        gitdir: string;
        cache: object;
        allowUnmerged?: boolean | undefined;
    }, closure: (arg0: GitIndex) => any): Promise<any>;
}
/**
 * A class for managing Git references, including reading, writing, deleting, and resolving refs.
 */
export class GitRefManager {
    /**
     * Updates remote refs based on the provided refspecs and options.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
     * @param {string} args.remote - The name of the remote.
     * @param {Map<string, string>} args.refs - A map of refs to their object IDs.
     * @param {Map<string, string>} args.symrefs - A map of symbolic refs.
     * @param {boolean} args.tags - Whether to fetch tags.
     * @param {string[]} [args.refspecs = undefined] - The refspecs to use.
     * @param {boolean} [args.prune = false] - Whether to prune stale refs.
     * @param {boolean} [args.pruneTags = false] - Whether to prune tags.
     * @returns {Promise<Object>} - An object containing pruned refs.
     */
    static updateRemoteRefs({ fs, gitdir, remote, refs, symrefs, tags, refspecs, prune, pruneTags, }: {
        fs: FSClient;
        gitdir?: string | undefined;
        remote: string;
        refs: Map<string, string>;
        symrefs: Map<string, string>;
        tags: boolean;
        refspecs?: string[] | undefined;
        prune?: boolean | undefined;
        pruneTags?: boolean | undefined;
    }): Promise<any>;
    /**
     * Writes a ref to the file system.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
     * @param {string} args.ref - The ref to write.
     * @param {string} args.value - The object ID to write.
     * @returns {Promise<void>}
     */
    static writeRef({ fs, gitdir, ref, value }: {
        fs: FSClient;
        gitdir?: string | undefined;
        ref: string;
        value: string;
    }): Promise<void>;
    /**
     * Writes a symbolic ref to the file system.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
     * @param {string} args.ref - The ref to write.
     * @param {string} args.value - The target ref.
     * @returns {Promise<void>}
     */
    static writeSymbolicRef({ fs, gitdir, ref, value }: {
        fs: FSClient;
        gitdir?: string | undefined;
        ref: string;
        value: string;
    }): Promise<void>;
    /**
     * Deletes a single ref.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
     * @param {string} args.ref - The ref to delete.
     * @returns {Promise<void>}
     */
    static deleteRef({ fs, gitdir, ref }: {
        fs: FSClient;
        gitdir?: string | undefined;
        ref: string;
    }): Promise<void>;
    /**
     * Deletes multiple refs.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
     * @param {string[]} args.refs - The refs to delete.
     * @returns {Promise<void>}
     */
    static deleteRefs({ fs, gitdir, refs }: {
        fs: FSClient;
        gitdir?: string | undefined;
        refs: string[];
    }): Promise<void>;
    /**
     * Resolves a ref to its object ID.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
     * @param {string} args.ref - The ref to resolve.
     * @param {number} [args.depth = undefined] - The maximum depth to resolve symbolic refs.
     * @returns {Promise<string>} - The resolved object ID.
     */
    static resolve({ fs, gitdir, ref, depth }: {
        fs: FSClient;
        gitdir?: string | undefined;
        ref: string;
        depth?: number | undefined;
    }): Promise<string>;
    /**
     * Checks if a ref exists.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
     * @param {string} args.ref - The ref to check.
     * @returns {Promise<boolean>} - True if the ref exists, false otherwise.
     */
    static exists({ fs, gitdir, ref }: {
        fs: FSClient;
        gitdir?: string | undefined;
        ref: string;
    }): Promise<boolean>;
    /**
     * Expands a ref to its full name.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
     * @param {string} args.ref - The ref to expand.
     * @returns {Promise<string>} - The full ref name.
     */
    static expand({ fs, gitdir, ref }: {
        fs: FSClient;
        gitdir?: string | undefined;
        ref: string;
    }): Promise<string>;
    /**
     * Expands a ref against a provided map.
     *
     * @param {Object} args
     * @param {string} args.ref - The ref to expand.
     * @param {Map<string, string>} args.map - The map of refs.
     * @returns {Promise<string>} - The expanded ref.
     */
    static expandAgainstMap({ ref, map }: {
        ref: string;
        map: Map<string, string>;
    }): Promise<string>;
    /**
     * Resolves a ref against a provided map.
     *
     * @param {Object} args
     * @param {string} args.ref - The ref to resolve.
     * @param {string} [args.fullref = args.ref] - The full ref name.
     * @param {number} [args.depth = undefined] - The maximum depth to resolve symbolic refs.
     * @param {Map<string, string>} args.map - The map of refs.
     * @returns {Object} - An object containing the full ref and its object ID.
     */
    static resolveAgainstMap({ ref, fullref, depth, map }: {
        ref: string;
        fullref?: string | undefined;
        depth?: number | undefined;
        map: Map<string, string>;
    }): any;
    /**
     * Reads the packed refs file and returns a map of refs.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
     * @returns {Promise<Map<string, string>>} - A map of packed refs.
     */
    static packedRefs({ fs, gitdir }: {
        fs: FSClient;
        gitdir?: string | undefined;
    }): Promise<Map<string, string>>;
    /**
     * Lists all refs matching a given filepath prefix.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
     * @param {string} args.filepath - The filepath prefix to match.
     * @returns {Promise<string[]>} - A sorted list of refs.
     */
    static listRefs({ fs, gitdir, filepath }: {
        fs: FSClient;
        gitdir?: string | undefined;
        filepath: string;
    }): Promise<string[]>;
    /**
     * Lists all branches, optionally filtered by remote.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
     * @param {string} [args.remote] - The remote to filter branches by.
     * @returns {Promise<string[]>} - A list of branch names.
     */
    static listBranches({ fs, gitdir, remote }: {
        fs: FSClient;
        gitdir?: string | undefined;
        remote?: string | undefined;
    }): Promise<string[]>;
    /**
     * Lists all tags.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} [args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
     * @returns {Promise<string[]>} - A list of tag names.
     */
    static listTags({ fs, gitdir }: {
        fs: FSClient;
        gitdir?: string | undefined;
    }): Promise<string[]>;
}
export class GitRemoteHTTP {
    /**
     * Returns the capabilities of the GitRemoteHTTP class.
     *
     * @returns {Promise<string[]>} - An array of supported capabilities.
     */
    static capabilities(): Promise<string[]>;
    /**
     * Discovers references from a remote Git repository.
     *
     * @param {Object} args
     * @param {HttpClient} args.http - The HTTP client to use for requests.
     * @param {ProgressCallback} [args.onProgress] - Callback for progress updates.
     * @param {AuthCallback} [args.onAuth] - Callback for providing authentication credentials.
     * @param {AuthFailureCallback} [args.onAuthFailure] - Callback for handling authentication failures.
     * @param {AuthSuccessCallback} [args.onAuthSuccess] - Callback for handling successful authentication.
     * @param {string} [args.corsProxy] - Optional CORS proxy URL.
     * @param {string} args.service - The Git service (e.g., "git-upload-pack").
     * @param {string} args.url - The URL of the remote repository.
     * @param {Object<string, string>} args.headers - HTTP headers to include in the request.
     * @param {1 | 2} args.protocolVersion - The Git protocol version to use.
     * @returns {Promise<Object>} - The parsed response from the remote repository.
     * @throws {HttpError} - If the HTTP request fails.
     * @throws {SmartHttpError} - If the response cannot be parsed.
     * @throws {UserCanceledError} - If the user cancels the operation.
     */
    static discover({ http, onProgress, onAuth, onAuthSuccess, onAuthFailure, corsProxy, service, url: _origUrl, headers, protocolVersion, }: {
        http: HttpClient;
        onProgress?: ProgressCallback | undefined;
        onAuth?: AuthCallback | undefined;
        onAuthFailure?: AuthFailureCallback | undefined;
        onAuthSuccess?: AuthSuccessCallback | undefined;
        corsProxy?: string | undefined;
        service: string;
        url: string;
        headers: {
            [x: string]: string;
        };
        protocolVersion: 1 | 2;
    }): Promise<any>;
    /**
     * Connects to a remote Git repository and sends a request.
     *
     * @param {Object} args
     * @param {HttpClient} args.http - The HTTP client to use for requests.
     * @param {ProgressCallback} [args.onProgress] - Callback for progress updates.
     * @param {string} [args.corsProxy] - Optional CORS proxy URL.
     * @param {string} args.service - The Git service (e.g., "git-upload-pack").
     * @param {string} args.url - The URL of the remote repository.
     * @param {Object<string, string>} [args.headers] - HTTP headers to include in the request.
     * @param {any} args.body - The request body to send.
     * @param {any} args.auth - Authentication credentials.
     * @returns {Promise<GitHttpResponse>} - The HTTP response from the remote repository.
     * @throws {HttpError} - If the HTTP request fails.
     */
    static connect({ http, onProgress, corsProxy, service, url, auth, body, headers, }: {
        http: HttpClient;
        onProgress?: ProgressCallback | undefined;
        corsProxy?: string | undefined;
        service: string;
        url: string;
        headers?: {
            [x: string]: string;
        } | undefined;
        body: any;
        auth: any;
    }): Promise<GitHttpResponse>;
}
/**
 * A class for managing Git remotes and determining the appropriate remote helper for a given URL.
 */
export class GitRemoteManager {
    /**
     * Determines the appropriate remote helper for the given URL.
     *
     * @param {Object} args
     * @param {string} args.url - The URL of the remote repository.
     * @returns {Object} - The remote helper class for the specified transport.
     * @throws {UrlParseError} - If the URL cannot be parsed.
     * @throws {UnknownTransportError} - If the transport is not supported.
     */
    static getRemoteHelperFor({ url }: {
        url: string;
    }): any;
}
export class GitShallowManager {
    /**
     * Reads the `shallow` file in the Git repository and returns a set of object IDs (OIDs).
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
     * @returns {Promise<Set<string>>} - A set of shallow object IDs.
     */
    static read({ fs, gitdir }: {
        fs: FSClient;
        gitdir?: string | undefined;
    }): Promise<Set<string>>;
    /**
     * Writes a set of object IDs (OIDs) to the `shallow` file in the Git repository.
     * If the set is empty, the `shallow` file is removed.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} [args.gitdir] - [required] The [git directory](dir-vs-gitdir.md) path
     * @param {Set<string>} args.oids - A set of shallow object IDs to write.
     * @returns {Promise<void>}
     */
    static write({ fs, gitdir, oids }: {
        fs: FSClient;
        gitdir?: string | undefined;
        oids: Set<string>;
    }): Promise<void>;
}
export class GitStashManager {
    /**
     * Gets the reference name for the stash.
     *
     * @returns {string} - The stash reference name.
     */
    static get refStash(): string;
    /**
     * Gets the reference name for the stash reflogs.
     *
     * @returns {string} - The stash reflogs reference name.
     */
    static get refLogsStash(): string;
    /**
     * Creates an instance of GitStashManager.
     *
     * @param {Object} args
     * @param {FSClient} args.fs - A file system implementation.
     * @param {string} args.dir - The working directory.
     * @param {string}[args.gitdir=join(dir, '.git')] - [required] The [git directory](dir-vs-gitdir.md) path
     */
    constructor({ fs, dir, gitdir }: {
        fs: FSClient;
        dir: string;
        gitdir?: string | undefined;
    });
    /**
     * Gets the file path for the stash reference.
     *
     * @returns {string} - The file path for the stash reference.
     */
    get refStashPath(): string;
    /**
     * Gets the file path for the stash reflogs.
     *
     * @returns {string} - The file path for the stash reflogs.
     */
    get refLogsStashPath(): string;
    /**
     * Retrieves the author information for the stash.
     *
     * @returns {Promise<Object>} - The author object.
     * @throws {MissingNameError} - If the author name is missing.
     */
    getAuthor(): Promise<any>;
    _author: void | {
        name: string;
        email: string;
        timestamp: number;
        timezoneOffset: number;
    } | undefined;
    /**
     * Gets the SHA of a stash entry by its index.
     *
     * @param {number} refIdx - The index of the stash entry.
     * @param {string[]} [stashEntries] - Optional preloaded stash entries.
     * @returns {Promise<string|null>} - The SHA of the stash entry or `null` if not found.
     */
    getStashSHA(refIdx: number, stashEntries?: string[]): Promise<string | null>;
    /**
     * Writes a stash commit to the repository.
     *
     * @param {Object} args
     * @param {string} args.message - The commit message.
     * @param {string} args.tree - The tree object ID.
     * @param {string[]} args.parent - The parent commit object IDs.
     * @returns {Promise<string>} - The object ID of the written commit.
     */
    writeStashCommit({ message, tree, parent }: {
        message: string;
        tree: string;
        parent: string[];
    }): Promise<string>;
    /**
     * Reads a stash commit by its index.
     *
     * @param {number} refIdx - The index of the stash entry.
     * @returns {Promise<Object>} - The stash commit object.
     * @throws {InvalidRefNameError} - If the index is invalid.
     */
    readStashCommit(refIdx: number): Promise<any>;
    /**
     * Writes a stash reference to the repository.
     *
     * @param {string} stashCommit - The object ID of the stash commit.
     * @returns {Promise<void>}
     */
    writeStashRef(stashCommit: string): Promise<void>;
    /**
     * Writes a reflog entry for a stash commit.
     *
     * @param {Object} args
     * @param {string} args.stashCommit - The object ID of the stash commit.
     * @param {string} args.message - The reflog message.
     * @returns {Promise<void>}
     */
    writeStashReflogEntry({ stashCommit, message }: {
        stashCommit: string;
        message: string;
    }): Promise<void>;
    /**
     * Reads the stash reflogs.
     *
     * @param {Object} args
     * @param {boolean} [args.parsed=false] - Whether to parse the reflog entries.
     * @returns {Promise<string[]|Object[]>} - The reflog entries as strings or parsed objects.
     */
    readStashReflogs({ parsed }: {
        parsed?: boolean | undefined;
    }): Promise<string[] | any[]>;
}
declare class GitConfig {
    static from(text: any): GitConfig;
    constructor(text: any);
    parsedConfig: any;
    get(path: any, getall?: boolean): Promise<any>;
    getall(path: any): Promise<any>;
    getSubsections(section: any): Promise<any>;
    deleteSection(section: any, subsection: any): Promise<void>;
    append(path: any, value: any): Promise<void>;
    set(path: any, value: any, append?: boolean): Promise<void>;
    toString(): any;
}
declare class GitIndex {
    [x: number]: () => {};
    static from(buffer: any): Promise<GitIndex>;
    static fromBuffer(buffer: any): Promise<GitIndex>;
    static _entryToBuffer(entry: any): Promise<any>;
    constructor(entries: any, unmergedPaths: any);
    _dirty: boolean;
    _unmergedPaths: any;
    _entries: any;
    _addEntry(entry: any): void;
    get unmergedPaths(): any[];
    get entries(): any[];
    get entriesMap(): any;
    get entriesFlat(): any;
    insert({ filepath, stats, oid, stage }: {
        filepath: any;
        stats: any;
        oid: any;
        stage?: number | undefined;
    }): void;
    delete({ filepath }: {
        filepath: any;
    }): void;
    clear(): void;
    has({ filepath }: {
        filepath: any;
    }): any;
    render(): string;
    toObject(): Promise<any>;
}
export {};
