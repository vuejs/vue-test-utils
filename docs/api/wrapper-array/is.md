# is(selector)

Returns true if every wrapper in wrapper array matches selector. Use any valid [selector](/api/selectors.md).

### Arguments

`selector` (`String`|`Component`): a CSS selector ('#id', '.class-name', 'tag') or a Vue component. See [selectors](/api/selectors.md).

### Returns

(`Boolean`): returns true if every wrapper in wrapper array matches selector.

### Example

```js
import { mount } from 'vue-test-utils';
import Foo from './Foo.vue';

const wrapper = mount(Foo);
const divArray = 
expect(wrapper.is('div')).to.equal(true);
```
