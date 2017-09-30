# find(selector)

- **Arguments:**
  - `{string|Component} selector`

- **Returns:** `{Wrapper}`

- **Usage:**

Returns [`Wrapper`](/docs/en/api/wrapper/README.md) of first DOM node or Vue component matching selector. 

Use any valid [selector](/docs/en/api/selectors.md).

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const div = wrapper.find('div')
expect(div.is('div')).to.equal(true)
const bar = wrapper.find(Bar)
expect(bar.is(Bar)).to.equal(true)
```

- **See also:** [Wrapper](/docs/en/api/wrapper/README.md)