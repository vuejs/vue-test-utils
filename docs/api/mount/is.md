# is(selector)

Returns true if wrapper node matches selector. Use any valid [selector](/api/mount/selectors.md).

### Arguments

`selector` (`String`|`Component`): a CSS selector ('#id', '.class-name', 'tag') or a Vue component. See [selectors](/api/mount/selectors.md).

### Returns

(`Boolean`): returns true if wrapper node matches selector.

### Example

```js
import { mount } from 'avoriaz';
import Foo from './Foo.vue';

const wrapper = mount(Foo);
expect(wrapper.is('div')).to.equal(true);
```
