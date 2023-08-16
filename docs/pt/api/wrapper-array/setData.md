## O método setData

Define os dados do `vm` do `Wrapper` (envolvedor) em cada `Wrapper` (envolvedor) dentro do `WrapperArray`.

**Note que todo `Wrapper` deve conter uma instância de Vue.**

- **Argumentos:**

  - `{Object} data`

- **Exemplo:**

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
