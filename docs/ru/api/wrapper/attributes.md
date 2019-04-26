## attributes()

Возвращает объект атрибутов DOM-узла `Wrapper`. Если аргумент `key` присутствует, метод вернёт значение атрибута, заданного через `key`.

- **Аргументы:**

  - `{string} key` **опционально**

- **Возвращает:** `{[attribute: string]: any}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.attributes().id).toBe('foo')
expect(wrapper.attributes('id')).toBe('foo')
```
