# attributes()

Возвращает объект атрибутов DOM-узла `Wrapper`.

- **Возвращает:** `{[attribute: string]: any}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.attributes().id).toBe('foo')
```