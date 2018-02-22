# find(selector)

입력한 셀렉터와 일치하는 첫번째 DOM 노드 또는 Vue 컴포넌트 [`Wrapper`](README.md)를 반환합니다.

올바른 [selector](selectors.md)를 사용하세요.

- **전달인자:**
  - `{string|Component} selector`

- **반환값:** `{Wrapper}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const div = wrapper.find('div')
expect(div.is('div')).toBe(true)
const bar = wrapper.find(Bar)
expect(bar.is(Bar)).toBe(true)
```

- **함께 보기:** [Wrapper](README.md)
