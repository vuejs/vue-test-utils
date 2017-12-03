# hasProp(prop, value)

Проверка, что `Wrapper` `vm` имеет `prop` с значением `value`.

Возвращает `true` если `Wrapper` `vm` имеет `prop` с значением `value`.

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
