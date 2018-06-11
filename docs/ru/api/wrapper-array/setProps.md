# setProps(props)

Устанавливает входные параметры `Wrapper` `vm` и выполняет принудительное обновление каждого `Wrapper` в `WrapperArray`.

**Обратите внимание, что каждый `Wrapper` должен содержать экземпляр Vue.**

- **Принимает:**
  - `{Object} props`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
barArray.setProps({ foo: 'bar' })
expect(barArray.at(0).vm.foo).toBe('bar')
```
