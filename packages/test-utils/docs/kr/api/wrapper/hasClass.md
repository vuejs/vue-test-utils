# hasClass(className)

`Wrapper` DOM 노드가 `className`의 클래스를 가진지 검증합니다.

`Wrapper` DOM 노드가 클래스를 가지고 있으면 `true`를 반환합니다.

- **전달인자:**
  - `{string} className`

- **반환값:** `{boolean}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.hasClass('bar')).toBe(true)
```
