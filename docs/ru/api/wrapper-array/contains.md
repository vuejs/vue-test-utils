# contains(selector)

Проверка, что каждый `Wrapper` в `WrapperArray` содержит указанный селектор.

Используйте любой валидный [селектор](../selectors.md).

- **Принимает:**
  - `{string|Component} selector`

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.contains('p')).toBe(true)
expect(divArray.contains(Bar)).toBe(true)
```
