## setMethods

::: warning Deprecation warning
`setMethods` is deprecated and will be removed in future releases.

There's no clear path to replace `setMethods`, because it really depends on your previous usage. It easily leads to flaky tests that rely on implementation details, which [is discouraged](https://github.com/vuejs/rfcs/blob/668866fa71d70322f6a7689e88554ab27d349f9c/active-rfcs/0000-vtu-api.md#setmethods).

Thus, we suggest to to rethink those tests using the tools Vue Test Utils provides.

If you need to stub out a complex method, extract it out from the component and test it in isolation. On the other hand, if you want to assert that a method is called, use your test runner to spy on it.
:::

Sets `Wrapper` `vm` methods and forces update.

**Note the Wrapper must contain a Vue instance.**

- **Arguments:**

  - `{Object} methods`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const clickMethodStub = sinon.stub()

wrapper.setMethods({ clickMethod: clickMethodStub })
wrapper.find('button').trigger('click')
expect(clickMethodStub.called).toBe(true)
```
