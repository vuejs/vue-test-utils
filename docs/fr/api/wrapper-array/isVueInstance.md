## isVueInstance

::: warning Avertissement de déprédation
`isVueInstance` est dépréciée et sera supprimée dans les prochaines versions.

Les tests reposant sur l'affirmation "isVueInstance" n'ont que peu ou pas de valeur. Nous suggérons de les remplacer par des assertions intentionnelles.

Pour conserver ces tests, un remplacement valable de `isVueInstance()` est une assertion véridique de `wrapper.find(...).vm`.
:::

Affirmer que chaque `Wrapper` dans `WrapperArray` est une instance de Vue.

- **Retours:** `{boolean}`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.isVueInstance()).toBe(true)
```
