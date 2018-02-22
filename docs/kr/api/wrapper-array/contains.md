# contains(selector)

`WrapperArray`의 모든 래퍼가 셀렉터를 가지고 있는지 검증합니다.

올바른 [selector](../selectors.md)를 사용하세요.

- **전달인자:**
  - `{string|Component} selector`

- **반환값:** `{boolean}`

- **예제:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.contains('p')).toBe(true)
expect(divArray.contains(Bar)).toBe(true)
```
