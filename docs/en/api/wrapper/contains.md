# contains(selector)

- **Arguments:**
  - `{string|Component} selector`

- **Returns:** `{boolean}`

- **Usage:**

Assert `Wrapper` contains an element or component matching [selector](/api/selectors.md).

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
expect(wrapper.contains('p')).to.equal(true)
expect(wrapper.contains(Bar)).to.equal(true)
```

- **See also:** [selectors](/api/selectors.md)
