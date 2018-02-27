# hasProp(prop, value)

<p><strong>⚠Cette page est actuellement en cours de traduction française. Vous pouvez repasser plus tard ou <a href="https://github.com/vuejs-fr/vue-test-utils" target="_blank">participer à la traduction</a> de celle-ci dès maintenant !</strong></p><p>Assert every `Wrapper` in `WrapperArray`  `vm` has `prop` matching `value`.</p>

**Note the Wrapper must contain a Vue instance.**

- **Arguments:**
  - `{string} prop`
  - `{any} value`

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.hasProp('bar', 10)).toBe(true)
```
