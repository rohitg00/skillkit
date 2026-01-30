# Typanion

> Static and runtime type assertion library with no dependencies

[![](https://img.shields.io/npm/v/typanion.svg)]() [![](https://img.shields.io/npm/l/typanion.svg)]() [![](https://img.shields.io/badge/developed%20with-Yarn%202-blue)](https://github.com/yarnpkg/berry)

## Installation

```
yarn add typanion
```

## Why

- Typanion can validate nested arbitrary data structures
- Typanion is type-safe; it uses [type predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates)
- Typanion allows you to derive types from your schemas
- Typanion can report detailed error reports

Compared to [yup](https://github.com/jquense/yup), Typanion has a better inference support for TypeScript + supports `isOneOf`. Its functional API makes it very easy to tree shake, which is another bonus (although the library isn't very large in itself).

## Documentation

Check the website for our documentation: [mael.dev/typanion](https://mael.dev/typanion/).

## Usage

First define a schema using the builtin operators:

```ts
import * as t from 'typanion';

const isMovie = t.isObject({
    title: t.isString(),
    description: t.isString(),
});
```

Then just call the schema to validate any `unknown` value:

```ts
const userData = JSON.parse(input);

if (isMovie(userData)) {
    console.log(userData.title);
}
```

Passing a second parameter allows you to retrieve detailed errors:

```ts
const userData = JSON.parse(input);
const errors: string[] = [];

if (!isMovie(userData, {errors})) {
    console.log(errors);
}
```

You can also apply coercion over the user input:

```ts
const userData = JSON.parse(input);
const coercions: Coercion[] = [];

if (isMovie(userData, {coercions})) {
    // Coercions aren't flushed by default
    for (const [p, op] of coercions) op();

    // All relevant fields have now been coerced
    // ...
}
```

You can derive the type from the schema and use it in other functions:

```ts
import * as t from 'typanion';

const isMovie = t.isObject({
    title: t.isString(),
    description: t.isString(),
});

type Movie = t.InferType<typeof isMovie>;

// Then just use your alias:
const printMovie = (movie: Movie) => {
    // ...
};
```

Schemas can be stored in multiple variables if needed:

```ts
import * as t from 'typanion';

const isActor = t.isObject({
    name: t.isString();
});

const isMovie = t.isObject({
    title: t.isString(),
    description: t.isString(),
    actors: t.isArray(isActor),
});
```

## License (MIT)

> **Copyright © 2020 Mael Nison**
>
> Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
