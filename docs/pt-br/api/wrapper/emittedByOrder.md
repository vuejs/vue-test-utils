# emittedByOrder()

Retorna um Array contendo os eventos customizados emitidos pelo `vm` do wrapper.

- **Retorna:** `Array<{ name: String, args: Array<any> }>`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('bar', 123)

/*
wrapper.emittedByOrder() retorna o seguinte Array:
[
  { name: 'foo', args: [] },
  { name: 'bar', args: [123] }
]
*/

// Verifica a ordem dos eventos chamados
expect(wrapper.emittedByOrder().map(e => e.name)).toEqual(['foo', 'bar'])
```
