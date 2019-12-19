## enableAutoDestroy(hook)

- **Arguments:**

  - `{Function} hook`

- **Usage:**

`enableAutoDestroy` will destroy all created `Wrapper` instances using the passed hook function (for example [`afterEach`](https://jestjs.io/docs/en/api#aftereachfn-timeout)).

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
