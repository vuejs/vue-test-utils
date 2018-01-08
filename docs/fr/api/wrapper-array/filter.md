# filter(predicate)

<p><strong>⚠Cette page est actuellement en cours de traduction française. Vous pouvez repasser plus tard ou <a href="https://github.com/vuejs-fr/vue-test-utils" target="_blank">participer à la traduction</a> de celle-ci dès maintenant !</strong></p><p>Filter `WrapperArray` with a predicate function on `Wrapper` objects.</p>

Behavior of this method is similar to [Array.prototype.filter](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Array/filter)

- **Arguments:**
  - `{function} predicate`

- **Returns:** `{WrapperArray}`

A new `WrapperArray` instance containing `Wrapper` instances that returns true for the predicate function.

- **Example:**

```js
import { shallow } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = shallow(Foo)
const filteredDivArray = wrapper.findAll('div', (w) => !w.hasClass('filtered'))
```
