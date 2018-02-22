# contains(selector)

`Wrapper` に要素、もしくは[セレクタ](../selectors.md)で指定したコンポーネントを含んでいるか検証します。

- **引数:**
  - `{string|Component} selector`

- **戻り値:** `{boolean}`

- **例:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
expect(wrapper.contains('p')).toBe(true)
expect(wrapper.contains(Bar)).toBe(true)
```

- **参照:** [セレクタ](../selectors.md)
