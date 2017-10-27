# is(selector)

Assert every `Wrapper` in `WrapperArray` DOM node or `vm` matches [selector](../selectors.md).

- **Принимает:**
  - `{string|Component} selector`

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.find('div')
expect(divArray.is('div')).toBe(true)
```
