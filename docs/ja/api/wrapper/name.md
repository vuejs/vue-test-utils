# name()

`Wrapper` に Vue インスタンスが含まれている場合はコンポーネント名を返し、そうでない場合は `Wrapper` DOM ノードのタグ名を返します。

- **戻り値:** `{string}`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.name()).toBe('Foo')
const p = wrapper.find('p')
expect(p.name()).toBe('p')
```
