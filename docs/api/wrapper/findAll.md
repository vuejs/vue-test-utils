# findAll(selector)

Returns an array of wrappers of DOM nodes or Vue components. Use any valid [selector](/api/selectors.md).

### Arguments

`selector` (`String`|`Component`): a CSS selector ('#id', '.class-name', 'tag') or a Vue component. See [selectors](/api/selectors.md).

### Returns

(`WrapperArray`): returns an `object` containing wrappers matching selector. Access wrappers using the `at` method


### Example

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const div = wrapper.findAll('div')
expect(div.is('div')).to.equal(true)
```

With a Vue Component:
```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const bar = wrapper.findAll(Bar).at(0)
expect(bar.isVueComponent).to.equal(true)
```
