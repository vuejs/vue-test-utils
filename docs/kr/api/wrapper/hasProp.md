# hasProp(prop, value)

`Wrapper`의 `vm`이 일치하는 `value`를 가진 `prop`을 검증합니다.

`Wrapper`의 `vm`이 일치하는 `value`를 가진 `prop`이 있으면 `true`를 반환합니다.

**참고: Wrapper는 Vue 인스턴스를 반드시 가지고 있어야합니다.**

- **전달인자:**
  - `{string} prop`
  - `{any} value`

- **반환값:** `{boolean}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasProp('bar', 10)).toBe(true)
```
