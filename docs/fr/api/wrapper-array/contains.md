### contains

Affirmer que chaque emballage dans `WrapperArray` contient un sélecteur.

Utilisez tout [selector](../selectors.md) valide.

- **Arguments:**

  - `{string|Component} selector`

- **Retours:** `{boolean}`

- **Exemple:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallowMount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.contains('p')).toBe(true)
expect(divArray.contains(Bar)).toBe(true)
```
