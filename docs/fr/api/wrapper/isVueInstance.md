## isVueInstance

::: warning Avertissement de déprédation
`isVueInstance` est dépréciée et sera supprimée dans les prochaines versions.

Les tests reposant sur l'affirmation `isVueInstance` n'ont que peu ou pas de valeur. Nous suggérons de les remplacer par des assertions ciblées.

Pour conserver ces tests, un remplacement valable de `isVueInstance()` est une assertion véridique de `wrapper.find(...).vm`.

L'assertion Wrapper est l'instance de Vue.
:::

- **Retours:** `{boolean}`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVueInstance()).toBe(true)
```
