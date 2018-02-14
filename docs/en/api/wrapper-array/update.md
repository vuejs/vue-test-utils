# `update()`

Force root Vue component of each `Wrapper` in `WrapperArray` to re-render.

If called on a Vue component wrapper array, it will force each Vue component to re-render.

- **Example:**

```js
import { mount } from '@vue/test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.at(0).vm.bar).toBe('bar')
divArray.at(0).vm.bar = 'new value'
divArray.update()
expect(divArray.at(0).vm.bar).toBe('new value')
```
