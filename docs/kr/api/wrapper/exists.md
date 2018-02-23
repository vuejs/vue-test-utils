# exists()

`Wrapper` 또는 `WrapperArray`가 존재하는지 검증합니다.

`Wrapper` 또는 `WrapperArray`가 비어있으면 false를 반환합니다.

- **반환값:** `{boolean}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.exists()).toBe(true)
expect(wrapper.find('does-not-exist').exists()).toBe(false)
expect(wrapper.findAll('div').exists()).toBe(true)
expect(wrapper.findAll('does-not-exist').exists()).toBe(false)
```
