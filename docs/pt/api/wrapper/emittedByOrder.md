## O método emittedByOrder

::: warning Aviso de Depreciação
O `emittedByOrder` está depreciado e será removido nos futuros lançamentos.

Ao invés disso use o `wrapper.emitted`.
:::

Retorna um objeto contento eventos personalizados emitidos pelo `Wrapper` (envolvedor) `vm`.


- **Retorna:** `Array<{ name: string, args: Array<any> }>`

- **Exemplo:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('bar', 123)

/*
wrapper.emittedByOrder() retorna o seguinte `Array`:
[
  { name: 'foo', args: [] },
  { name: 'bar', args: [123] }
]
*/

// afirma que o evento emite a ordem
expect(wrapper.emittedByOrder().map(e => e.name)).toEqual(['foo', 'bar'])
```
