# text()

Возвращает текстовое содержимое `Wrapper`.

- **Возвращает:** `{string}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.text()).toBe('bar')
```
