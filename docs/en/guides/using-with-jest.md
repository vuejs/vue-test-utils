## Using with Jest

Jest and `vue-test-utils` work great together.

To get started, we need to install Jest and `vue-test-utils`:

```
npm install --save-dev jest vue-test-utils
```

Inside `package.json`, create an npm script that runs Jest:

```
"scripts": {
  "unit": "jest"
}
```

Add a `Component.spec.js` file:

```js
import { mount } from 'vue-test-utils'

const Component = {
  name: 'component',
  render: (h) => h('div', 'Hello, World!')
}

describe('Component', () => {
  test('renders "Hello, World!"', () => {
    const wrapper = mount(Component)
    expect(wrapper.text()).toBe('Hello, World!')
  })
})
```

And run the tests from the command line:
```
npm run unit
```

To test .vue files, please see the [testing SFCs with Jest guide](./testing-SFCs-with-jest.md).

## Resources

- [Example project with Jest and `vue-test-utils`](https://github.com/eddyerburgh/vue-test-utils-jest-example)
