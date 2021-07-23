## name

::: warning Avertissement de déprédation
`name` est dépréciée et sera supprimée dans les prochaines versions.
:::

Retourne le nom du composant si `Wrapper` contient une instance de Vue, ou le nom du tag du nœud DOM `Wrapper` si `Wrapper` ne contient pas d'instance de Vue.

- **Retours:** `{string}`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.name()).toBe('Foo')
const p = wrapper.find('p')
expect(p.name()).toBe('p')
```
