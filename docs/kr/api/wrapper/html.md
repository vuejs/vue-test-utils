# html()

`Wrapper` DOM 노드의 HTML을 문자열로 반환합니다.

- **반환값:** `{string}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.html()).toBe('<div><p>Foo</p></div>')
```
