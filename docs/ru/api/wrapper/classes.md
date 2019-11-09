## classes()

Возвращает классы DOM-узла `Wrapper`.

Возвращает массив имён классов. Либо `true`/`false` если передано имя класса.

- **Аргументы:**

  - `{string} className` **опционально**

- **Возвращает:** `Array<{string}>`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.classes()).toContain('bar')
expect(wrapper.classes('bar')).toBe(true)
```
