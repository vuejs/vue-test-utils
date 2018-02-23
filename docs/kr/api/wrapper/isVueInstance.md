# isVueInstance()

`Wrapper`가 Vue 인스턴스인지 검증합니다.

- **반환값:** `{boolean}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.isVueInstance()).toBe(true)
 ```
