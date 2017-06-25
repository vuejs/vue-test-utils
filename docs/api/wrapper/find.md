# find(selector)

Returns [`Wrapper`](/api/wrapper/README.md) of first DOM node or Vue component matching selector. Use any valid [selector](/api/selectors.md).

### Arguments

`selector` (`String`|`Component`): a CSS selector ('#id', '.class-name', 'tag') or a Vue component. See [selectors](/api/selectors.md).

### Returns

(`Wrapper`): returns a [`Wrapper`](/api/wrapper/README.md)


### Example

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const div = wrapper.find('div')
expect(div.is('div')).to.equal(true)
```

With a Vue Component:
```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const bar = wrapper.find(Bar)
expect(bar.isVueComponent).to.equal(true)
```
