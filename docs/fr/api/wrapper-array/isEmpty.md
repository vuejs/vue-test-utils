## isEmpty

::: Avertissement de déprédation
`isEmpty` est dépréciée et sera supprimée dans les prochaines versions.

Pensez à un matcheur personnalisé comme ceux fournis dans [jest-dom](https://github.com/testing-library/jest-dom#tobeempty).

En cas d'utilisation avec findComponent, accédez à l'élément DOM avec findComponent(Comp).element
:::

Affirmer que chaque `Wrapper` dans `WrapperArray` ne contient pas de nœud enfant.

- **Retours:** `{boolean}`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.isEmpty()).toBe(true)
```
