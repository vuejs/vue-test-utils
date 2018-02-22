# update()

Принудительный перерендеринг корневого компонента Vue.

Если вызывается на `Wrapper` содержащем `vm`, то будет вызван принудительный перерендеринг `Wrapper` `vm`.

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.vm.bar).toBe('bar')
wrapper.vm.bar = 'new value'
wrapper.update()
expect(wrapper.vm.bar).toBe('new value')
```
