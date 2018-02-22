# contains(selector)

`Wrapper` 컴포넌트에 엘리먼트나 컴포넌트에 매칭하는 [selector](../selectors.md)가 있는지 검증합니다.

- **전달인자:**
  - `{string|Component} selector`

- **반환값:** `{boolean}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
expect(wrapper.contains('p')).toBe(true)
expect(wrapper.contains(Bar)).toBe(true)
```

- **함께 보기:** [selectors](../selectors.md)
