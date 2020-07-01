## findComponent

最初に一致した Vue コンポーネントの `Wrapper` を返します。

- **引数:**

  - `{Component|ref|name} selector`

- **戻り値:** `{Wrapper}`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)

const bar = wrapper.findComponent(Bar) // => コンポーネントインスタンスによってバーを検索します
expect(bar.exists()).toBe(true)
const barByName = wrapper.findComponent({ name: 'bar' }) // => `name` でバーを検索します
expect(barByName.exists()).toBe(true)
const barRef = wrapper.findComponent({ ref: 'bar' }) // => `ref` でバーを検索します
expect(barRef.exists()).toBe(true)
```
