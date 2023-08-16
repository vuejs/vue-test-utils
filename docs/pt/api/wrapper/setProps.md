## O método setProps

- **Argumentos:**

  - `{Object} props`

- **Uso:**

Define as propriedades do `vm` (modelo do vue) do `Wrapper` (envolvedor) e força a atualização.

::: warning
O método `setProps` deve ser chamado apenas para o componente de alto-nível, montado pelo método `mount` ou `shallowMount`
:::

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

test('setProps demo', async () => {
  const wrapper = mount(Foo)

  await wrapper.setProps({ foo: 'bar' })

  expect(wrapper.vm.foo).toBe('bar')
})
```

Você pode também passar um objeto `propsData`, o qual inicializará a instância de Vue com os valores passados.

```js
// Foo.vue
export default {
  props: {
    foo: {
      type: String,
      required: true
    }
  }
}
```

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo, {
  propsData: {
    foo: 'bar'
  }
})

expect(wrapper.vm.foo).toBe('bar')
```
