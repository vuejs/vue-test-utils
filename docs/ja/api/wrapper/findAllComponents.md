## findAllComponents

一致するすべてのVueコンポーネントの `WrapperArray` を返します。

- **引数:**

  - `{Component|ref|name} selector`

- **戻り値:** `{WrapperArray}`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const bar = wrapper.findAllComponents(Bar).at(0)
expect(bar.exists()).toBeTruthy()
const bars = wrapper.findAllComponents(Bar)
expect(bar).toHaveLength(1)
```
