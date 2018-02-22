# hasAttribute(attribute, value)

`WrapperArray`의 모든 `Wrapper` DOM 노드의 `attribute`와 일치하는 `value`를 가지는지 검증합니다.

- **전달인자:**
  - `{string} attribute`
  - `{string} value`

- **반환값:** `{boolean}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.hasAttribute('id', 'foo')).toBe(true)
```
