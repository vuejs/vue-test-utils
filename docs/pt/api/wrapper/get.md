## O método get

::: warning Aviso de Depreciação
O uso do método `get` para pesquisar por um componente está depreciado e será removido. Use o [`getComponent`](./getComponent.md) para isso.
:::

Funciona de forma similar ao [`find`](./find.md) mas com a diferença de que lançará um erro se não encontrar nada que corresponda ao seletor dado. Você deve usar o `find` quando estiver procurando por um elemento que talvez não exista. Você deve usar o método `get` quando estiver buscando um elemento que deve existir e ele fornecerá um mensagem de erro agradável se não for o caso.

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Foo)

// similar ao `wrapper.find`.
// `get` lançará um erro se um elemento não for encontrado. O `find` não fará nada.
expect(wrapper.get('.does-exist'))

expect(() => wrapper.get('.does-not-exist'))
  .to.throw()
  .with.property(
    'message',
    'Unable to find .does-not-exist within: <div>the actual DOM here...</div>'
  )
```
