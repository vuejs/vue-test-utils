# hasStyle(style, value)

Проверка, что каждый `Wrapper` в `WrapperArray` DOM-узле имеет стиль с указанным значением.

Возвращает `true` если `Wrapper` DOM-узел имеет `style` с значением `value`.

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
const divArray = wrapper.findAll('div')
expect(divArray.hasStyle('color', 'red')).toBe(true)
```
