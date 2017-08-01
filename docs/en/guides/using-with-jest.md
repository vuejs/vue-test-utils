# Using with Jest

## Setup Jest

Jest is a test runner developed by Facebook, aiming to come with everything included to get started. [Learn more about Jest](https://facebook.github.io/jest/)  So let's get started:

```bash
$ yarn add jest
```

will install jest and makes it available to be executed through yarn or a package script.

```json
// package.json
{
  "scripts": {
    "test": "yarn"
  }
}
```

or

```bash
$ yarn jest
```

As you probably want to use latest javascript capabilities inside your specs though, it's recommendable to enable `babel` for the project.


```bash
$ yarn add babel babel-jest babel-preset-env
```

If you’ve not heard of babel-preset-env, it basically allows compiling the JS based on the browsers you plan to support. Get more info here: [babel-preset-env](https://github.com/babel/babel-preset-env)

Be sure to update your `.babelrc` file accordingly

```json
{
  "presets": [
    ["env", {
      "targets": {
        "browsers": ["last 2 versions", "safari >= 7"]
      }
    }]
  ]
}
```

That's pretty much everything necessary to do before writing the first specs.

### Where should my tests live

By default, jest will pick up all files that have a `.spec.js` or `.test.js` extension. If this does not fit your needs, it's possible [to chang the testRegex](https://facebook.github.io/jest/docs/en/configuration.html#testregex-string) in the config section in the `package.json` file.

Jest recommends to create a `__spec__` folder, but feel free to do as you like. Just know ahead of time, that when using the [snapshot](https://facebook.github.io/jest/docs/en/snapshot-testing.html#content) feature, snapshots will get stored in a `__snapshot__` folder.

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

- Examples and slides from Vue Conf 2017 - https://github.com/codebryo/vue-testing-with-jest-conf17
- Jest - https://facebook.github.io/jest/
- Babel preset env - https://github.com/babel/babel-preset-env

