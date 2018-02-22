# isVueInstance()

`WrapperArray`의 모든 `Wrapper`가 Vue 인스턴스인지 검증합니다.

- **반환값:** `{boolean}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
expect(barArray.isVueInstance()).toBe(true)
```
