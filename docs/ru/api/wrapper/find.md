# find(selector)

Возвращает [`Wrapper`](README.md) первого DOM узла или компонента Vue, соответствующий селектору.

Используйте любой валидный [селектор](../selectors.md).

- **Принимает:**
  - `{string|Component} selector`

- **Возвращает:** `{Wrapper}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const div = wrapper.find('div')
expect(div.is('div')).toBe(true)
const bar = wrapper.find(Bar)
expect(bar.is(Bar)).toBe(true)
```

- **См. также:** [Wrapper](README.md)
