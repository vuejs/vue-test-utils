# isVueInstance()

Проверка, что каждый `Wrapper` в `WrapperArray` является экземпляром Vue.

- **Возвращает:** `{boolean}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.isVueInstance()).toBe(true)
```
