# update()

Вызывает принудительный перерендеринг корневого компонента Vue у каждого `Wrapper` в `WrapperArray`.

Если вызывается на массиве wrapper, содержащем компоненты Vue, то будет вызван принудительный перерендеринг каждого компонента Vue.

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.at(0).vm.bar).toBe('bar')
divArray.at(0).vm.bar = 'new value'
divArray.update()
expect(divArray.at(0).vm.bar).toBe('new value')
```
