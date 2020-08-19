## setData(data)

Устанавливает данные `Wrapper` `vm` на каждом `Wrapper` в `WrapperArray`.

**Обратите внимание, что каждый `Wrapper` должен содержать экземпляр Vue.**

- **Принимает:**

  - `{Object} data`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

test('setData demo', async () => {
  const wrapper = mount(Foo)
  const barArray = wrapper.findAll(Bar)
  await barArray.setData({ foo: 'bar' })
  expect(barArray.at(0).vm.foo).toBe('bar')
})
```
