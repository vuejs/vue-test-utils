# findAll(selector)

- **Usage:**

Returns a [`WrapperArray`](../wrapper-array/README.md) of [Wrappers](README.md). 

Use any valid [selector](../selectors.md).

- **Arguments:**
  - `{string|Component} selector`

- **Returns:** `{WrapperArray}`

- **Example:**

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

- **See also:** [Wrapper](README.md)