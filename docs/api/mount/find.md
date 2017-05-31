# find(selector)

Returns an array of wrappers of DOM nodes or Vue components. Use any valid [avoriaz selector](/api/selectors.md).

### Arguments

`selector` (`String`|`Component`): a CSS selector ('#id', '.class-name', 'tag') or a Vue component. See [selectors](/api/selectors.md).

### Returns

(`Array`): returns an `array` of wrappers matching selector. Vue component wrappers have extra methods ([computed](/api/mount/computed.md), [data](/api/mount/data.md), [methods](/api/mount/methods.md), [propsData](/api/mount/propsData.md)). To check if a wrapper is a Vue component wrapper, use wrapper.isVueComponent.

### Example

```js
import { mount } from 'vue-test-utils';
import Foo from './Foo.vue';

const wrapper = mount(Foo);
const div = wrapper.find('div')[0];
expect(div.is('div')).to.equal(true);
```

With a Vue Component:
```js
import { mount } from 'vue-test-utils';
import Foo from './Foo.vue';
import Bar from './Bar.vue'

const wrapper = mount(Foo);
const bar = wrapper.find(Bar)[0];
expect(bar.isVueComponent).to.equal(true);
```
