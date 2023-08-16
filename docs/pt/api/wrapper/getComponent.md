## O método getComponent

Funciona de forma similar ao [`findComponent`](./findComponent.md) mas com a diferença de que lançará um erro se não encontrar nada que corresponda ao seletor dado. Você deve usar o `findComponent` quando estiver procurando por um elemento que talvez não exista. Você deve usar o método `getComponent` quando estiver buscando um elemento que deve existir e ele fornecerá um mensagem de erro agradável se não for o caso.

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

// similar ao `wrapper.findComponent`.
// `getComponent` lançará um erro se um elemento não for encontrado. O `findComponent` não fará nada.
expect(wrapper.getComponent(Bar)) // => obtenha o Brar pela instância do componente
expect(wrapper.getComponent({ name: 'bar' })) // => obtenha o Bar pelo `name`
expect(wrapper.getComponent({ ref: 'bar' })) // => obtenha o Bar pelo `ref`

expect(() => wrapper.getComponent({ name: 'does-not-exist' }))
  .to.throw()
  .with.property(
    'message',
    "Unable to get a component named 'does-not-exist' within: <div>the actual DOM here...</div>"
  )
```
