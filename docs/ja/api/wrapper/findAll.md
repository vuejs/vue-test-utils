# findAll(selector)

- **Arguments:**
  - `{string|Component} selector`

- **Returns:** `{WrapperArray}`

- **Usage:**

Returns a [`WrapperArray`](/docs/en/api/wrapper-array/README.md) of [Wrappers](/docs/en/api/wrapper/README.md). 

Use any valid [selector](/docs/en/api/selectors.md).

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const div = wrapper.findAll('div').at(0)
expect(div.is('div')).to.equal(true)
const bar = wrapper.findAll(Bar).at(0)
expect(bar.is(Bar)).to.equal(true)
```

- **See also:** [Wrapper](/docs/en/api/wrapper/README.md)