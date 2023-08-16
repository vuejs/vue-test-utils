## O método setData

Define os dados do `vm` (modelo do vue) do `Wrapper` (envolvedor).

O `setData` funciona através da chamada recursiva do `Vue.set`.

**Nota que o `Wrapper` deve conter uma instância de Vue.**

- **Argumentos:**

  - `{Object} data`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

test('setData demo', async () => {
  const wrapper = mount(Foo)

  await wrapper.setData({ foo: 'bar' })

  expect(wrapper.vm.foo).toBe('bar')
})
```
