# find(selector)

Returns Wrapper of first DOM node or Vue component matching selector. Use any valid [selector](/api/shallow/selectors.md).

### Arguments

`selector` (`String`): a CSS selector ('#id', '.class-name', 'tag') or a Vue component. See [selectors](/api/shallow/selectors.md).

### Returns

(`Wrapper`): returns a Wrapper `object`


### Example

```js
import { mount } from 'vue-test-utils';
import Foo from './Foo.vue';

const wrapper = shallow(Foo);
const div = wrapper.find('div');
expect(div.is('div')).to.equal(true);
```
