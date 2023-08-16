## O método attributes

Retorna o `Wrapper` (envolvedor) do objeto de atributo de um nó do DOM. Se a `key` for fornecida, o valor para o `key` será retornado.

- **Argumentos:**

  - `{string} key` **opcional**

- **Retorna:** `{[attribute: string]: any} | string`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.attributes().id).toBe('foo')
expect(wrapper.attributes('id')).toBe('foo')
```
