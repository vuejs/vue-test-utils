# contains(selector)

Returns true if wrapper contains selector. Use any valid [selector](/api/selectors.md).

### Arguments

`selector` (`String`|`Component`): a CSS selector ('#id', '.class-name', 'tag') or a Vue component. See [selectors](/api/selectors.md).

### Returns

(`Boolean`): returns `true` if wrapper contains selector.

### Example

```js
import { mount } from 'vue-test-utils';
import Foo from './Foo.vue';

const wrapper = mount(Foo);
expect(wrapper.contains('p')).to.equal(true);
```


`Bar.spec.js`

```js
import { mount } from 'vue-test-utils'
import Bar from './Bar.vue'
import Foo from './Foo.vue'

const wrapper = mount(Bar)
expect(wrapper.contains(Foo)).to.equal(true)
```
