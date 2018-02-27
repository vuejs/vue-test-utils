# hasProp(prop, value)

`WrapperArray`의 모든 `Wrapper`의 DOM 노드가 `prop`과 일치하는 `value`를 가지는지 검증합니다.

**참고: Wrapper는 Vue 인스턴스를 반드시 가지고 있어야합니다.**

- **전달인자:**
  - `{string} prop`
  - `{any} value`

- **반환값:** `{boolean}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.hasProp('bar', 10)).toBe(true)
```
