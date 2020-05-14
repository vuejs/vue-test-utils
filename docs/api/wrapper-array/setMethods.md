## setMethods

::: warning Deprecation warning
`setMethods` is deprecated and will be removed in future releases.

There's no clear path to replace `setMethods`, because it really depends on your previous usage. It easily leads to flaky tests that rely on implementation details, which [is discouraged](<(https://github.com/vuejs/rfcs/blob/668866fa71d70322f6a7689e88554ab27d349f9c/active-rfcs/0000-vtu-api.md#setmethods)>).

Thus, we suggest to to rethink those tests using the tools Vue Test Utils provides.
:::

Sets `Wrapper` `vm` methods and forces update on each `Wrapper` in `WrapperArray`.

**Note every `Wrapper` must contain a Vue instance.**

- **Arguments:**

  - `{Object} methods`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
const clickMethodStub = sinon.stub()

barArray.setMethods({ clickMethod: clickMethodStub })
barArray.at(0).trigger('click')
expect(clickMethodStub.called).toBe(true)
```
