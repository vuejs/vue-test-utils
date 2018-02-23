# isVueInstance()

`WrapperArray` の全ての `Wrapper` が Vue インスタンスであるか検証します。

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.isVueInstance()).toBe(true)
```
