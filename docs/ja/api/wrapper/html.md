# html()

`Wrapper` DOM ノードの HTML を文字列として返します。

- **戻り値:** `{string}`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.html()).toBe('<div><p>Foo</p></div>')
```
