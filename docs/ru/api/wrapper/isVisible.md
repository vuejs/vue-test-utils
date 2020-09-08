## isVisible()

Проверяет, что `Wrapper` виден.

Возвращает `false`, если какой-либо предок имеет стили `display: none`, `visibility: hidden`, `opacity: 0`, аттрибут `hidden` или находится в свёрнутом элементе `<details>`.

Это можно использовать для проверки, что компонент скрыт с помощью `v-show`.

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVisible()).toBe(true)
expect(wrapper.find('.is-not-visible').isVisible()).toBe(false)
```
