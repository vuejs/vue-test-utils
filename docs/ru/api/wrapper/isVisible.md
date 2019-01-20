## isVisible()

Утверждает, что `Wrapper` видимый.

Возвращает `false`, если по крайней мере один элемент предка имеет стиль `display: none` или `visibility: hidden`.

Это можно использовать для утверждения, что компонент скрыт с помощью `v-show`.

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVisible()).toBe(true)
expect(wrapper.find('.is-not-visible').isVisible()).toBe(false)
```
