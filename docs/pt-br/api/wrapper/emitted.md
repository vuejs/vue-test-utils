# emitted()

Retorna um objeto contendo os eventos cutomizados emitidos pelo `vm` do wrapper.

- **Retorna:** `{ [name: String]: Array<Array<any>> }`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Componente)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
wrapper.emitted() retorna o seguinte objeto:
{
  foo: [[], [123]]
}
*/

// Verifica se o evento foi emitido
expect(wrapper.emitted().foo).toBeTruthy()

// Verifica aquantidade de emissões do evento
expect(wrapper.emitted().foo.length).toBe(2)

// Verifica a carga do segundo evento foo emitido
expect(wrapper.emitted().foo[1]).toEqual([123])
```
