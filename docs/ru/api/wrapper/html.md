## html()

Возвращает HTML-код DOM-узла `Wrapper`а в виде строки.

- **Возвращает:** `{string}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.html()).toBe('<div><p>Foo</p></div>')
```
