# name()

Возвращает имя компонента, если `Wrapper` содержит экземпляр Vue, или имя тега DOM-узла `Wrapper` если `Wrapper` не содержит экземпляра Vue.

- **Возвращает:** `{string}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.name()).toBe('Foo')
const p = wrapper.find('p')
expect(p.name()).toBe('p')
```
