# find(selector)

Returns Wrapper of first DOM node or Vue component matching selector. Use any valid [selector](/api/mount/selectors.md).

### Arguments

`selector` (`String`|`Component`): a CSS selector ('#id', '.class-name', 'tag') or a Vue component. See [selectors](/api/mount/selectors.md).

### Returns

(`Wrapper`): returns a Wrapper `object`


### Example

```js
import { mount } from 'vue-test-utils';
import Foo from './Foo.vue';

const wrapper = mount(Foo);
const div = wrapper.find('div');
expect(div.is('div')).to.equal(true);
```

With a Vue Component:
```js
import { mount } from 'vue-test-utils';
import Foo from './Foo.vue';
import Bar from './Bar.vue'

const wrapper = mount(Foo);
const bar = wrapper.find(Bar);
expect(bar.isVueComponent).to.equal(true);
```
