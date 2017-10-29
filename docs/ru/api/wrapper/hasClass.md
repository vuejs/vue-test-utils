# hasClass(className)

Проверка, что `Wrapper` DOM узел имеет класс, содержащий `className`.

Возвращает `true` если `Wrapper` DOM узел содержит класс.

- **Принимает:**
  - `{string} className`

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasClass('bar')).toBe(true)
```
