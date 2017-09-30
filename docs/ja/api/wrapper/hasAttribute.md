# hasAttribute(attribute, value)

- **Arguments:**
  - `{string} attribute`
  - `{string} value`

- **Returns:** `{boolean}`

- **Usage:**

Assert `Wrapper` DOM node has attribute matching value.

Returns `true` if `Wrapper` DOM node contains attribute with matching value.

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasAttribute('id', 'foo')).to.equal(true)
```

- **Alternative:**

You could get the attribute from the `Wrapper.element` to have a value based assertion:

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.element.getAttribute('id')).to.equal('foo')
```

This makes for a more informative assertion error.
