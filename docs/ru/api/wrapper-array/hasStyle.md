# hasStyle(style, value)

Проверка, что каждый `Wrapper` в `WrapperArray` DOM node has style matching value.

Returns `true` if `Wrapper` DOM node has `style` matching `string`.

**Обратите внимание, что определяются только inline-стили при запуске в `jsdom`.**

- **Принимает:**
  - `{string} style`
  - `{string} value`

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasStyle('color', 'red')).toBe(true)
```
