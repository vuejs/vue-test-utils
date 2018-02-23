# text()

`Wrapper` のテキスト内容を返します。

- **戻り値:** `{string}`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.text()).toBe('bar')
```
