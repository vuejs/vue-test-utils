# `contains(selector)`

Проверка, что `Wrapper` содержит элемент или компонент, соответствующий [селектору](../selectors.md).

- **Принимает:**
  - `{string|Component} selector`

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
expect(wrapper.contains('p')).toBe(true)
expect(wrapper.contains(Bar)).toBe(true)
```

- **См. также:** [Селекторы](../selectors.md)
