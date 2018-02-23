# html()

Возвращает HTML `Wrapper` DOM узла в виде строки.

- **Возвращает:** `{string}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.html()).toBe('<div><p>Foo</p></div>')
```
