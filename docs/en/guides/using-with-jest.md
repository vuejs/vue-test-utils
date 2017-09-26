Jest and Vue Test Utils work great together.

To get started, you need to install Jest and Vue Test Utils:

```
npm install --save-dev jest vue-test-utils
```

Inside package.json, create an npm script that runs Jest:

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

If you want to test .vue files, please see the testing SFCs with Jest guide.
