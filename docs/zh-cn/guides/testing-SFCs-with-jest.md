# Testing Single File Components with Jest

> An example project for this setup is available on [GitHub](https://github.com/vuejs/vue-test-utils-jest-example).

Jest is a test runner developed by Facebook, aiming to deliver a battery-included unit testing solution. You can learn more about Jest on its [official documentation](https://facebook.github.io/jest/).

## Setting up Jest

We will assume you are starting with a setup that already has webpack, vue-loader and Babel properly configured - e.g. the `webpack-simple` template scaffolded by `vue-cli`.

The first thing to do is install Jest and `vue-test-utils`:

```bash
$ npm install --save-dev jest vue-test-utils
```

Next we need to define a unit script in our `package.json`.

```json
// package.json
{
  "scripts": {
    "test": "jest"
  }
}
```

## Processing SFCs in Jest

To teach Jest how to process `*.vue` files, we will need to install and configure the `jest-vue` preprocessor:

``` bash
npm install --save-dev jest-vue
```

Next, create a `jest` block in `package.json`:

``` json
{
  // ...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      // tell Jest to handle *.vue files
      "vue"
    ],
    "transform": {
      // process *.vue files with jest-vue
      ".*\\.(vue)$": "<rootDir>/node_modules/jest-vue"
    },
    "mapCoverage": true
  }
}
```

> **Note:** `jest-vue` currently does not support all the features of `vue-loader`, for example custom block support and style loading. In addition, some webpack-specific features such as code-splitting are not supported either. To use them, read the guide on [testing SFCs with Mocha + webpack](./testing-SFCs-with-mocha-webpack.md).

## Handling webpack Aliases

If you use a resolve alias in the webpack config, e.g. aliasing `@` to `/src`, you need to add a matching config for Jest as well, using the `moduleNameMapper` option:

``` json
{
  // ...
  "jest": {
    // ...
    // support the same @ -> src alias mapping in source code
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

## Configuring Babel for Jest

Although latest versions of Node already supports most ES2015 features, you may still want to use ES modules syntax and stage-x features in your tests. For that we need to install `babel-jest`:

``` bash
npm install --save-dev babel-jest
```

Next, we need to tell Jest to process JavaScript test files with `babel-jest` by adding an entry under `jest.transform` in `package.json`:

``` json
{
  // ...
  "jest": {
    // ...
    "transform": {
      // ...
      // process js with babel-jest
      "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
    },
    // ...
  }
}
```

> By default, `babel-jest` automatically configures itself as long as it's installed. However, because we have explicitly added a transform for `*.vue` files, we now need to explicitly configure `babel-jest` as well.

Assuming using `babel-preset-env` with webpack, the default Babel config disables ES modules transpilation because webpack already knows how to handle ES modules. However, we do need to enable it for our tests because Jest tests run directly in Node.

Also, we can tell `babel-preset-env` to target the Node version we are using. This skips transpiling unnecessary features and makes our tests boot faster.

To apply these options only for tests, put them in a separate config under `env.test` (this will be automatically picked up by `babel-jest`).

Example `.babelrc`:

``` json
{
  "presets": [
    ["env", { "modules": false }]
  ],
  "env": {
    "test": {
      "presets": [
        ["env", { "targets": { "node": "current" }}]
      ]
    }
  }
}
```

### Snapshot Testing

You can use [`vue-server-renderer`](https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer) to render a component into a string so that it can be saved as a snapshot for [Jest snapshot testing](https://facebook.github.io/jest/docs/en/snapshot-testing.html).

The render result of `vue-server-renderer` includes a few SSR-specific attributes, and it ignores whitespaces, making it harder to scan a diff. We can improve the saved snapshot with a custom serializer:

``` bash
npm install --save-dev jest-serializer-vue
```

Then configure it in `package.json`:

``` json
{
  // ...
  "jest": {
    // ...
    // serializer for snapshots
    "snapshotSerializers": [
      "<rootDir>/node_modules/jest-serializer-vue"
    ]
  }
}
```

### Placing Test Files

By default, jest will recursively pick up all files that have a `.spec.js` or `.test.js` extension in the entire project. If this does not fit your needs, it's possible [to change the testRegex](https://facebook.github.io/jest/docs/en/configuration.html#testregex-string) in the config section in the `package.json` file.

Jest recommends creating a `__tests__` directory right next to the code being tested, but feel free to structure your tests as you see fit. Just beware that Jest would create a `__snapshots__` directory next to test files that performs snapshot testing.

### Example Spec

If you are familiar with Jasmine, you should feel right at home with Jest's [assertion API](https://facebook.github.io/jest/docs/en/expect.html#content):

```js
import { mount } from 'vue-test-utils'
import Component from './component'

describe('Component', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(Component)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
```

### Resources

- [Example project for this setup](https://github.com/vuejs/vue-test-utils-jest-example)
- [Examples and slides from Vue Conf 2017](https://github.com/codebryo/vue-testing-with-jest-conf17)
- [Jest](https://facebook.github.io/jest/)
- [Babel preset env](https://github.com/babel/babel-preset-env)
