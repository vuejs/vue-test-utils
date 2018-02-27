# hasClass(className)

`WrapperArray`의 모든 `Wrapper`의 DOM 노드가 `className` 이름의 클래스를 가지는지 검증합니다.

- **전달인자:**
  - `{string} className`

- **반환값:** `{boolean}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasClass('bar')).toBe(true)
```
