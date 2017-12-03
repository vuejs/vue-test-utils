# hasAttribute(attribute, value)

<p><strong>⚠Cette page est actuellement en cours de traduction française. Vous pouvez repasser plus tard ou <a href="https://github.com/vuejs-fr/vue-test-utils" target="_blank">participer à la traduction</a> de celle-ci dès maintenant !</strong></p><p>Assert `Wrapper` DOM node has attribute matching value.</p>

Returns `true` if `Wrapper` DOM node contains attribute with matching value.

- **Arguments:**
  - `{string} attribute`
  - `{string} value`

- **Returns:** `{boolean}`

- **Example:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasAttribute('id', 'foo')).toBe(true)
```

- **Alternative:**

You could get the attribute from the `Wrapper.element` to have a value based assertion:

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.element.getAttribute('id')).toBe('foo')
```

This makes for a more informative assertion error.
