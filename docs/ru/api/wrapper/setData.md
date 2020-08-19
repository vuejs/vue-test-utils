## setData(data)

Устанавливает данные `Wrapper` `vm`.

setData работает путём рекурсивного вызова Vue.set.

**Обратите внимание, что `Wrapper` должен содержать экземпляр Vue.**

setData работает путём слияния существующих свойств, за исключением массивов, которые перезаписываются.

- **Принимает:**

  - `{Object} data`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

test('setData demo', async () => {
  const wrapper = mount(Foo)

  await wrapper.setData({ foo: 'bar' })

  expect(wrapper.vm.foo).toBe('bar')
})
```
