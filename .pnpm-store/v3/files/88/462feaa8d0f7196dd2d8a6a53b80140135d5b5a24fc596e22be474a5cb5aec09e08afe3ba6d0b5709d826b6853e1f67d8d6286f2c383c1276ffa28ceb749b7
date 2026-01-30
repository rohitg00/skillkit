export const __esModule: boolean;
/**
 * A wrapper class for file system operations, providing a consistent API for both promise-based
 * and callback-based file systems. It includes utility methods for common file system tasks.
 */
export class FileSystem {
    /**
     * Creates an instance of FileSystem.
     *
     * @param {Object} fs - A file system implementation to wrap.
     */
    constructor(fs: any);
    _original_unwrapped_fs: any;
    /**
     * Return true if a file exists, false if it doesn't exist.
     * Rethrows errors that aren't related to file existence.
     *
     * @param {string} filepath - The path to the file.
     * @param {Object} [options] - Additional options.
     * @returns {Promise<boolean>} - `true` if the file exists, `false` otherwise.
     */
    exists(filepath: string, options?: any): Promise<boolean>;
    /**
     * Return the contents of a file if it exists, otherwise returns null.
     *
     * @param {string} filepath - The path to the file.
     * @param {Object} [options] - Options for reading the file.
     * @returns {Promise<Buffer|string|null>} - The file contents, or `null` if the file doesn't exist.
     */
    read(filepath: string, options?: any): Promise<Buffer | string | null>;
    /**
     * Write a file (creating missing directories if need be) without throwing errors.
     *
     * @param {string} filepath - The path to the file.
     * @param {Buffer|Uint8Array|string} contents - The data to write.
     * @param {Object|string} [options] - Options for writing the file.
     * @returns {Promise<void>}
     */
    write(filepath: string, contents: Buffer | Uint8Array | string, options?: any | string): Promise<void>;
    /**
     * Make a directory (or series of nested directories) without throwing an error if it already exists.
     *
     * @param {string} filepath - The path to the directory.
     * @param {boolean} [_selfCall=false] - Internal flag to prevent infinite recursion.
     * @returns {Promise<void>}
     */
    mkdir(filepath: string, _selfCall?: boolean): Promise<void>;
    /**
     * Delete a file without throwing an error if it is already deleted.
     *
     * @param {string} filepath - The path to the file.
     * @returns {Promise<void>}
     */
    rm(filepath: string): Promise<void>;
    /**
     * Delete a directory without throwing an error if it is already deleted.
     *
     * @param {string} filepath - The path to the directory.
     * @param {Object} [opts] - Options for deleting the directory.
     * @returns {Promise<void>}
     */
    rmdir(filepath: string, opts?: any): Promise<void>;
    /**
     * Read a directory without throwing an error is the directory doesn't exist
     *
     * @param {string} filepath - The path to the directory.
     * @returns {Promise<string[]|null>} - An array of file names, or `null` if the path is not a directory.
     */
    readdir(filepath: string): Promise<string[] | null>;
    /**
     * Return a flat list of all the files nested inside a directory
     *
     * Based on an elegant concurrent recursive solution from SO
     * https://stackoverflow.com/a/45130990/2168416
     *
     * @param {string} dir - The directory to read.
     * @returns {Promise<string[]>} - A flat list of all files in the directory.
     */
    readdirDeep(dir: string): Promise<string[]>;
    /**
     * Return the Stats of a file/symlink if it exists, otherwise returns null.
     * Rethrows errors that aren't related to file existence.
     *
     * @param {string} filename - The path to the file or symlink.
     * @returns {Promise<Object|null>} - The stats object, or `null` if the file doesn't exist.
     */
    lstat(filename: string): Promise<any | null>;
    /**
     * Reads the contents of a symlink if it exists, otherwise returns null.
     * Rethrows errors that aren't related to file existence.
     *
     * @param {string} filename - The path to the symlink.
     * @param {Object} [opts={ encoding: 'buffer' }] - Options for reading the symlink.
     * @returns {Promise<Buffer|null>} - The symlink target, or `null` if it doesn't exist.
     */
    readlink(filename: string, opts?: any): Promise<Buffer | null>;
    /**
     * Write the contents of buffer to a symlink.
     *
     * @param {string} filename - The path to the symlink.
     * @param {Buffer} buffer - The symlink target.
     * @returns {Promise<void>}
     */
    writelink(filename: string, buffer: Buffer): Promise<void>;
}
