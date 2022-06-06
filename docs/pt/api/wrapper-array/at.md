## O método at

Retorna o `Wrapper` (envolvedor) no `índice` passado. Usa numeração baseada em zero (exemplo. o primeiro item está no índice 0).
Se o `índice` for negativo, a indexação começa com o último elemento (exemplo. o último item está no índice -1).

- **Argumentos:**

  - `{number} index`

- **Retorna:** `{Wrapper}`

- **Exemplo:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallowMount(Foo)
const divArray = wrapper.findAll('div')

const secondDiv = divArray.at(1)
expect(secondDiv.is('div')).toBe(true)

const lastDiv = divArray.at(-1)
expect(lastDiv.is('div')).toBe(true)
```
