# hasStyle(style, value)

Проверка, что `Wrapper` DOM узел имеет стиль, соответствующий указанном значению

Возвращает `true` если `Wrapper` DOM узел имеет стиль `style` совпадающий с `value`.

**Обратите внимание, что определяются только inline-стили при запуске в `jsdom`.**

- **Принимает:**
  - `{string} style`
  - `{string} value`

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasStyle('color', 'red')).toBe(true)
```
