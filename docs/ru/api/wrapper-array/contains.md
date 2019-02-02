### contains(selector)

Проверка, что каждая обёртка (`Wrapper`) в `WrapperArray` содержит селектор.

Используйте любой корректный [селектор](../selectors.md).

- **Принимает:**

  - `{string|Component} selector`

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallowMount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.contains('p')).toBe(true)
expect(divArray.contains(Bar)).toBe(true)
```
