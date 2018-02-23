# at(indice)

Retorna o wrapper correspondente ao `indice` passado. Use números para corresponder ao item do arra, por exemplo o `indice` 0 para o primeiro elemento.

- **Argumentos:**
  - `{number} indice`

- **Retorna:** `{Wrapper}`

- **Exemplo:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
const divArray = wrapper.findAll('div')

const segundaDiv = divArray.at(1)
expect(segundaDiv.is('p')).toBe(true)
```
