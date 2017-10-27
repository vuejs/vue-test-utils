# hasAttribute(attribute, value)

Assert every `Wrapper` in `WrapperArray` DOM node has `attribute` matching `value`.

- **Принимает:**
  - `{string} attribute`
  - `{string} value`

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasAttribute('id', 'foo')).toBe(true)
```
