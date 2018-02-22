# isEmpty()

Проверка, что каждый `Wrapper` в `WrapperArray` не содержит дочерних узлов.

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.isEmpty()).toBe(true)
```
