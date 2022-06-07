## O método filter

Filtra o `WrapperArray` com uma função atribuída sobre objetos `Wrapper` (envoledor). 

O comportamento deste método é similar ao [Array.prototype.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).


- **Argumentos:**

  - `{function} predicate`

- **Retorna:** `{WrapperArray}`

Uma nova instância de `WrapperArray` contendo instâncias de `Wrapper` que torna `true` para a função atribuída.

- **Exemplo:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallowMount(Foo)
const filteredDivArray = wrapper
  .findAll('div')
  .filter(w => !w.classes('filtered'))
```
