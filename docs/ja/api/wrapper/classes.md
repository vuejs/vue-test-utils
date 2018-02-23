# classes()

`Wrapper` にラップされている要素の class 名を配列で返します。

- **戻り値:** `Array<{string}>`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.classes()).toContain('bar')
```
