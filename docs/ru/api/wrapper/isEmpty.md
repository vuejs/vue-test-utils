# isEmpty()

Проверяет, что `Wrapper` не содержит дочерних узлов.

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isEmpty()).toBe(true)
```
