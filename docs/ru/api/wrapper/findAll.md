# findAll(selector)

Возвращает [`WrapperArray`](../wrapper-array/README.md), состоящий из [Wrappers](README.md).

Используйте любой валидный [селектор](../selectors.md).

- **Принимает:**
  - `{string|Component} selector`

- **Возвращает:** `{WrapperArray}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const div = wrapper.findAll('div').at(0)
expect(div.is('div')).toBe(true)
const bar = wrapper.findAll(Bar).at(0)
expect(bar.is(Bar)).toBe(true)
```

- **См. также:** [Wrapper](README.md)
