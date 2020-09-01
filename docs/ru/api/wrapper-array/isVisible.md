## isVisible()

Утверждает, что каждый `Wrapper` в `WrapperArray` виден.

Возвращает `false`, если по крайней мере для одного из элементов какой-либо предок имеет стили `display: none`, `visibility: hidden`, `opacity: 0`, аттрибут `hidden` или находится в свёрнутом элементе `<details>`.

Это можно использовать для проверки, что компонент скрыт с помощью `v-show`.

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVisible()).toBe(true)
expect(wrapper.findAll('.is-not-visible').isVisible()).toBe(false)
expect(wrapper.findAll('.is-visible').isVisible()).toBe(true)
```
