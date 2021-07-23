## isEmpty

::: warning Avertissement de déprédation
`isEmpty` est déprécié et sera supprimé dans les prochaines versions.

Considérez un appariement personnalisé tel que ceux fournis dans [jest-dom](https://github.com/testing-library/jest-dom#tobeempty).

En cas d'utilisation avec findComponent, accédez à l'élément DOM avec `findComponent(Comp).element`
:::

Affirmer que `Wrapper` ne contient pas de nœud enfant.

- **Retours:** `{boolean}`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isEmpty()).toBe(true)
```
