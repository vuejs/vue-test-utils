## O método props

Retorna o objeto de propriedades do `Wrapper` (envolvedor) do `vm` (modelo do vue). Se a `key` for fornecida, o valor para a `key` será retornado.

**Nota que o `Wrapper` deve conter uma instância de Vue.**

- **Argumentos:**

  - `{string} key` **opcional**

- **Retorna:** `{[prop: string]: any} | any`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo, {
  propsData: {
    bar: 'baz'
  }
})
expect(wrapper.props().bar).toBe('baz')
expect(wrapper.props('bar')).toBe('baz')
```
