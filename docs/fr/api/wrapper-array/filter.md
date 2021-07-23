## filter

Filtrez `WrapperArray` avec une fonction de prédicat sur les objets `Wrapper`.

Le comportement de cette méthode est similaire à celui de [Array.prototype.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter).

- **Arguments:**

  - `{function} predicate`

- **Retours:** `{WrapperArray}`

Une nouvelle instance `WrapperArray` contenant des instances de `Wrapper` qui retourne vrai pour la fonction prédicat.

- **Exemple:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = shallowMount(Foo)
const filteredDivArray = wrapper
  .findAll('div')
  .filter(w => !w.classes('filtered'))
```
