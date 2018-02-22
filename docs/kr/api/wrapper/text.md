# text()

`Wrapper`가 가지고 있는 문자열을 반환합니다.

- **반환값:** `{string}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.text()).toBe('bar')
```
