# setComputed(computedObjects)

Устанавливает для `Wrapper` `vm` вычисляемое свойство и принудительно обновляет каждый `Wrapper` в `WrapperArray`.

**Каждый `Wrapper` должен содержать экземпляр Vue.**
**Каждый экземпляр Vue должен уже иметь вычисляемое свойство, переданные в `setComputed`.**

- **Аргументы:**
  - `{Object} вычисляемые свойства`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)

barArray.setComputed({
  computed1: 'new-computed1',
  computed2: 'new-computed2'
})
```