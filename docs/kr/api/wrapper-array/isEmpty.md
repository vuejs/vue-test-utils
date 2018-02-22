# isEmpty()

`WrapperArray`의 모든 `Wrapper`가 자식 노드가 없는지 검증합니다.

- **반환값:** `{boolean}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
const divArray = wrapper.findAll('div')
expect(divArray.isEmpty()).toBe(true)
```
