# name()

- **Returns:** `{string}`

- **Usage:**

Returns component name if `Wrapper` contains a Vue instance, or the tag name of `Wrapper` DOM node if `Wrapper` does not contain a Vue instance.

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.name()).to.equal('Foo')
const p = wrapper.find('p')
expect(p.name()).to.equal('p')
```