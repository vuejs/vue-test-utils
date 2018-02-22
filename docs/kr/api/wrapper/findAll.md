# findAll(selector)

[Wrappers](README.md)의 [`WrapperArray`](../wrapper-array/README.md)를 반환합니다.

올바른 [selector](selectors.md)를 사용하세요.

- **전달인자:**
  - `{string|Component} selector`

- **반환값:** `{WrapperArray}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const div = wrapper.findAll('div').at(0)
expect(div.is('div')).toBe(true)
const bar = wrapper.findAll(Bar).at(0)
expect(bar.is(Bar)).toBe(true)
```

- **함께 보기:** [Wrapper](README.md)
