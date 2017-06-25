# contains(selector)

Returns true if every wrapper in array contains selector. Use any valid [selector](/api/selectors.md).

### Arguments

`selector` (`String`|`Component`): a CSS selector ('#id', '.class-name', 'tag') or a Vue component. See [selectors](/api/selectors.md).

### Returns

(`Boolean`): returns `true` if every wrapper in wrapper array contains selector.

### Example

```js
import { shallow } from 'vue-test-utils';
import Foo from './Foo.vue';

const wrapper = shallow(Foo);
const divArray = wrapper.findAll('div')
expect(divArray.contains('p')).to.equal(true)
```

```js
import { shallow } from 'vue-test-utils'
import Bar from './Bar.vue'
import Foo from './Foo.vue'

const wrapper = shallow(Foo);
const divArray = wrapper.findAll('div')
expect(divArray.contains(Bar)).to.equal(true)
```
