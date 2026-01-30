# <img src="./logo.svg" height="25" /> Clipanion

> Type-safe CLI library with no runtime dependencies

[![npm version](https://img.shields.io/npm/v/clipanion.svg)](https://yarnpkg.com/package/clipanion) [![Licence](https://img.shields.io/npm/l/clipanion.svg)](https://github.com/arcanis/clipanion#license-mit) [![Yarn](https://img.shields.io/github/package-json/packageManager/arcanis/clipanion)](https://github.com/yarnpkg/berry)

## Installation

```sh
yarn add clipanion
```

## Why

- Clipanion supports advanced typing mechanisms
- Clipanion supports nested commands (`yarn workspaces list`)
- Clipanion supports transparent option proxying without `--` (for example `yarn dlx eslint --fix`)
- Clipanion supports all option types you could think of (including negations, batches, ...)
- Clipanion offers a [Typanion](https://github.com/arcanis/typanion) integration for increased validation capabilities
- Clipanion generates an optimized state machine out of your commands
- Clipanion generates good-looking help pages out of the box
- Clipanion offers common optional command entries out-of-the-box (e.g. version command, help command)

Clipanion is used in [Yarn](https://github.com/yarnpkg/berry) with great success.

## Documentation

Check the website for our documentation: [mael.dev/clipanion](https://mael.dev/clipanion/).

## Migration

You can use [`clipanion-v3-codemod`](https://github.com/paul-soporan/clipanion-v3-codemod) to migrate a Clipanion v2 codebase to v3.

## Overview

Commands are declared by extending from the `Command` abstract base class, and more specifically by implementing its `execute` method which will then be called by Clipanion. Whatever exit code it returns will then be set as the exit code for the process:

```ts
class SuccessCommand extends Command {
    async execute() {
        return 0;
    }
}
```

Commands can also be exposed via one or many arbitrary paths using the `paths` static property:

```ts
class FooCommand extends Command {
    static paths = [[`foo`]];
    async execute() {
        this.context.stdout.write(`Foo\n`);
    }
}

class BarCommand extends Command {
    static paths = [[`bar`]];
    async execute() {
        this.context.stdout.write(`Bar\n`);
    }
}
```

Options are defined as regular class properties, annotated by the helpers provided in the `Option` namespace. If you use TypeScript, all property types will then be properly inferred with no extra work required:

```ts
class HelloCommand extends Command {
    // Positional option
    name = Option.String();

    async execute() {
        this.context.stdout.write(`Hello ${this.name}!\n`);
    }
}
```

Option arguments can be validated and coerced using the [Typanion](https://mael.dev/typanion/) library:

```ts
class AddCommand extends Command {
    a = Option.String({required: true, validator: t.isNumber()});
    b = Option.String({required: true, validator: t.isNumber()});

    async execute() {
        this.context.stdout.write(`${this.a + this.b}\n`);
    }
}
```

## License (MIT)

> **Copyright © 2019 Mael Nison**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
