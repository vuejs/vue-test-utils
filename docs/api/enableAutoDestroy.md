## enableAutoDestroy(hook)

- **Arguments:**

  - `{Function} hook`

- **Usage:**

`enableAutoDestroy` will destroy all created `Wrapper` instances using the passed hook function (for example [`afterEach`](https://jestjs.io/docs/en/api#aftereachfn-timeout)). After calling the method, you can revert to the default behavior by calling the `resetAutoDestroyState` method.

```js
import { enableAutoDestroy, mount } from '@vue/test-utils'
import Foo from './Foo.vue'

// calls wrapper.destroy() after each test
enableAutoDestroy(afterEach)

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo)
    expect(wrapper.contains('div')).toBe(true)
    // no need to call wrapper.destroy() here
  })
})
```

## resetAutoDestroyState

- **Usage:**

After calling `enableAutoDestroy` you might need to disable auto-destroy behavior (for example when some of your test suites rely on wrapper being persistent across separate tests)

To achieve this you might call `resetAutoDestroyState` to disable previously registered hook

```js
import {
  enableAutoDestroy,
  resetAutoDestroyState,
  mount
} from '@vue/test-utils'
import Foo from './Foo.vue'

// calls wrapper.destroy() after each test
enableAutoDestroy(afterEach)
// resets auto-destroy after suite completes
afterAll(resetAutoDestroyState)

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo)
    expect(wrapper.contains('div')).toBe(true)
    // no need to call wrapper.destroy() here
  })
})
```
