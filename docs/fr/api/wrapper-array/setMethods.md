## setMethods

::: warning Avertissement de déprédation
`setMethods` est dépréciée et sera supprimée dans les prochaines versions.

Il n'y a pas de voie clair pour remplacer les "setMethods", car cela dépend vraiment de votre utilisation précédente. Cela conduit facilement à des tests bancals qui s'appuient sur des détails de mise en œuvre, ce qui [est déconseillé](https://github.com/vuejs/rfcs/blob/668866fa71d70322f6a7689e88554ab27d349f9c/active-rfcs/0000-vtu-api.md#setmethods).

Nous suggérons de repenser ces tests.

Pour mettre au point une méthode complexe, il faut l'extraire du composant et le tester de manière isolée. Pour affirmer qu'une méthode est appelée, utilisez votre testeur pour l'espionner.
:::

Défini les `Wrapper` `vm` et force la mise à jour de chaque `Wrapper` dans `WrapperArray`.

**Note chaque `Wrapper` doit contenir une instance de Vue.**

- **Arguments:**

  - `{Object} methods`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
const clickMethodStub = sinon.stub()

barArray.setMethods({ clickMethod: clickMethodStub })
barArray.at(0).trigger('click')
expect(clickMethodStub.called).toBe(true)
```
