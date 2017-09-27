# Testing single file components with Jest

Jest is a test runner developed by Facebook, aiming to come with everything included to get started. [Learn more about Jest](https://facebook.github.io/jest/)  So let's get started.

To test SFCs, we need to compile the files before running them in node.

*Note: Jest uses a jest-vue transformer. It does not contain all the features of vue-loader, like custom block support and style loading. To use them, read the [testing SFCs with Mocha](./testing-SFCs-with-mocha-webpack.md) guide*

## Setting up Jest

The first thing to do is install Jest:

```bash
$ npm install --save-dev jest
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

As you probably want to use latest javascript capabilities inside your specs though, it's recommendable to enable `babel` for the project.


```bash
$ npm install --save-dev babel babel-jest babel-preset-env
```

*If you’ve not heard of babel-preset-env, it basically allows compiling the JS based on the browsers you plan to support. Get more info here: [babel-preset-env](https://github.com/babel/babel-preset-env)*

We need to add a `.babelrc` file, to tell babel to use the env preset:

```json
{
  "presets": ["env"]
}
```

By default, Jest doesn't recognize .vue files. So we need to tell Jest how to handle them. To do that we need to install jest-vue, which preprocesses .vue files:

```
npm install --sav-dev jest-vue
```

In our `package.json`, we need to add a field to tell Jest how to treat .vue files:
```json
// package.json
{
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "vue"
    ],
    "transform": {
      "^.+\\.js$": "<rootDir>/node_modules/babel-jest",
      ".*\\.(vue)$": "<rootDir>/node_modules/jest-vue"
    },
    "mapCoverage": true
  }
}
```

That's pretty much everything necessary to do before writing the first specs.

### Where should my tests live

By default, jest will pick up all files that have a `.spec.js` or `.test.js` extension. If this does not fit your needs, it's possible [to chang the testRegex](https://facebook.github.io/jest/docs/en/configuration.html#testregex-string) in the config section in the `package.json` file.

Jest recommends to create a `__tests__` folder, but feel free to do as you like. Just know ahead of time, that when using the [snapshot](https://facebook.github.io/jest/docs/en/snapshot-testing.html#content) feature, snapshots will get stored in a `__snapshot__` folder.

### Example Spec

If you are familiar with Jasmine, or similar test libraries you should feel at home in Jest right away. Many useful assertions are in place, so
enjoy writing specs.

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

- [Examples and slides from Vue Conf 2017](https://github.com/codebryo/vue-testing-with-jest-conf17)
- [Jest](https://facebook.github.io/jest/)
- [Babel preset env](https://github.com/babel/babel-preset-env)
