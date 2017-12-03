# hasClass(className)

Проверка, что каждый `Wrapper` в `WrapperArray` DOM узле имеет класс `className`.

- **Принимает:**
  - `{string} className`

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasClass('bar')).toBe(true)
```
