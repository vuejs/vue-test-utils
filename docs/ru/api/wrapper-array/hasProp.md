# hasProp(prop, value)

Проверка, что каждый `Wrapper` в `WrapperArray`  `vm` имеет входной параметр `prop` с значением `value`.

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
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.hasProp('bar', 10)).toBe(true)
```
