# hasStyle(style, value)

Check if wrapper DOM node has style matching value

### Arguments

`style` (`String`): style name to assert value of.
`value` (`String`): the value style property should hold.

### Returns

(`Boolean`): `true` if element contains style with matching value,
`false` otherwise.

## Example
```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasStyle('color', 'red')).to.equal(true)
```

### Note

Will only work with inline styles when running in `jsdom`.
