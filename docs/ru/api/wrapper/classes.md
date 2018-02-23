# classes()

Возвращает классы DOM-узла `Wrapper`.

Возвращает массив имён классов.

- **Возвращает:** `Array<{string}>`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.classes()).toContain('bar')
```