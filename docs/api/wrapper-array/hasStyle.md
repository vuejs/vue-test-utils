# hasStyle(style, value)

Check if every wrapper vnode in wrapper array has a `style` matching `value`. Returns a boolean.

### Arguments

`style` (`String`): style name to assert value of.
`value` (`String`): the value style property should hold.

### Returns

(`Boolean`): `true` if every wrapper vnode contains class. `false` otherwise.
`false` otherwise.

## Example
```js
import { mount } from 'vue-test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasStyle('color', 'red')).to.equal(true)
```

### Note

Only checks inline styles when running in `jsdom`.
