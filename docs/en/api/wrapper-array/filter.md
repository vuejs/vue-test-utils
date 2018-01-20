# filter(predicate)

Filter `WrapperArray` with a predicate function on `Wrapper` objects.

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
