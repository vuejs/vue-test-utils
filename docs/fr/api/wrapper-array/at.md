## at

Retourne `Wrapper` à `index` passé. Utilise une numérotation basée sur les zéros (c'est-à-dire que le premier élément est à l'index 0).
Si `index` est négatif, l'indexation commence à partir du dernier élément (c'est-à-dire que le premier élément est à l'index -1).

- **Arguments:**

  - `{number} index`

- **Retours:** `{Wrapper}`

- **Exemple:**

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
