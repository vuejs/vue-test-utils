# hasProp(prop, value)

Assert `Wrapper` `vm` has `prop` matching `value`.

Returns `true` if `Wrapper` `vm` has `prop` matching `value`.

**Обратите внимание, что `Wrapper` должен содержать экземпляр Vue.**

- **Принимает:**
  - `{string} prop`
  - `{any} value`

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasProp('bar', 10)).toBe(true)
```
