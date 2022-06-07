## O método setProps

Define as propriedades do `vm` do `Wrapper` (envolvedor) e força a atualização de cada `Wrapper` dentro do `WrapperArray`.

**Note que todo `Wrapper` deve conter uma instância de Vue.**

- **Argumentos:**

  - `{Object} props`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

test('setProps demo', async () => {
  const wrapper = mount(Foo)
  const barArray = wrapper.findAll(Bar)
  await barArray.setProps({ foo: 'bar' })
  expect(barArray.at(0).vm.foo).toBe('bar')
})
```
