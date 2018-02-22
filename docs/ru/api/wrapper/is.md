# is(selector)

Проверяет, что DOM-элемент `Wrapper` или `vm` соответствуют [селектору](../selectors.md).

- **Принимает:**
  - `{string|Component} selector`

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.is('div')).toBe(true)
```
