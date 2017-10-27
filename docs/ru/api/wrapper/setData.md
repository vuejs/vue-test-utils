# setData(data)

Sets `Wrapper` `vm` data and forces update.

**Обратите внимание, что `Wrapper` должен содержать экземпляр Vue.**

- **Принимает:**
  - `{Object} data`

- **Пример:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setData({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')
```
