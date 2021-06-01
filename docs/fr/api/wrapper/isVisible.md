## isVisible

Affirmer que `Wrapper` est visible.

Retourne `false` si un élément parent a le style `display: none` ou `visibility: hidden`, est situé à l'intérieur de la balise <details> fermée ou possède un attribut caché.

Ceci peut être utilisé pour affirmer qu'un élément est caché par `v-show`.

- **Retours:** `{boolean}`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVisible()).toBe(true)
expect(wrapper.find('.is-not-visible').isVisible()).toBe(false)
```
