import tty from 'tty';

function getDefaultColorDepth() {
    if (tty && `getColorDepth` in tty.WriteStream.prototype)
        return tty.WriteStream.prototype.getColorDepth();
    if (process.env.FORCE_COLOR === `0`)
        return 1;
    if (process.env.FORCE_COLOR === `1`)
        return 8;
    if (typeof process.stdout !== `undefined` && process.stdout.isTTY)
        return 8;
    return 1;
}
let gContextStorage;
function getCaptureActivator(context) {
    let contextStorage = gContextStorage;
    if (typeof contextStorage === `undefined`) {
        if (context.stdout === process.stdout && context.stderr === process.stderr)
            return null;
        const { AsyncLocalStorage: LazyAsyncLocalStorage } = require(`async_hooks`);
        contextStorage = gContextStorage = new LazyAsyncLocalStorage();
        const origStdoutWrite = process.stdout._write;
        process.stdout._write = function (chunk, encoding, cb) {
            const context = contextStorage.getStore();
            if (typeof context === `undefined`)
                return origStdoutWrite.call(this, chunk, encoding, cb);
            return context.stdout.write(chunk, encoding, cb);
        };
        const origStderrWrite = process.stderr._write;
        process.stderr._write = function (chunk, encoding, cb) {
            const context = contextStorage.getStore();
            if (typeof context === `undefined`)
                return origStderrWrite.call(this, chunk, encoding, cb);
            return context.stderr.write(chunk, encoding, cb);
        };
    }
    return (fn) => {
        return contextStorage.run(context, fn);
    };
}

export { getCaptureActivator, getDefaultColorDepth };
