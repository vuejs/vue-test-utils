## Os seletores

Há muitos métodos que recebem um seletor como um argumento. Um seletor pode ser tanto um seletor CSS, um componente do Vue, ou um método `find` de objeto.

### Seletores CSS

O mount manipula qualquer seletor css válido:

- seletores de tags (`div`, `foo`, `bar`)
- seletores de classe (`.foo`, `.bar`)
- seletores de atributos (`[foo]`, `[foo="bar"]`)
- seletores de id (`#foo`, `#bar`)
- pseudo-seletores (`div:first-of-type`)

You can also use combinators:
Você também pode usar combinações:

- combinador de descendente direto (`div > #bar > .foo`)
- combinador de descendente genérico (`div #bar .foo`)
- seletor de irmão adjacente (`div + .foo`)
- seletor de irmão genérico (`div ~ .foo`)

### Componentes do Vue

Os componentes do Vue também são seletores válidos.

```js
// Foo.vue

export default {
  name: 'FooComponent'
}
```

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallowMount(Foo)
expect(wrapper.is(Foo)).toBe(true)
```

### Método `Find` de Objeto

#### Name (nome)

Ao usar um método `find` de objeto, o Vue Test Utils permite a seleção de elementos pelo `name` do componente no wrapper (envolvedor) de componentes.

```js
const buttonWrapper = wrapper.find({ name: 'my-button' })
buttonWrapper.trigger('click')
```

#### Ref (referência)

Ao usar um método `find` de objeto, o Vue Test Utils permite a seleção de elementos pelo `$ref` no wrapper (envolvedor) de componentes.

```js
const buttonWrapper = wrapper.find({ ref: 'myButton' })
buttonWrapper.trigger('click')
```
