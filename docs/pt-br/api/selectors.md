# Seletores

Muitos métodos desse wrapper leva um seletor como argumento. Um seletor pode ser um seletor CSS ou um componente do Vue.

## Seletores CSS

O método `mount` controla e suporta qualquer seletor válido:

- seletores de tag (div, foo, bar)
- seletores de classes (.foo, .bar)
- seletores de atributos ([foo], [foo="bar"])
- seletores de ids (#foo, #bar)
- pseudo seletores (div:first-of-type)

Você também pode usar qualquer combinação:

- combinador de descendente direto (div > #bar > .foo)
- combinador de descendente geral (div #bar .foo)
- seletor de irmão adjacente (div + .foo)
- seletor geral de irmãos (div ~ .foo)

## Componentes do Vue

Os componentes do Vue também são seletores válidos.

O vue-test-utils usa a propriedade `name` para buscar a instância na árvore de componentes do Vue.

```js
// Foo.vue

export default{
  name: 'FooComponente'
}
```

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
expect(wrapper.is(Foo)).toBe(true)
```
