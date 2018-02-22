# name()

`Wrapper`가 Vue 인스턴스를 가지고 있으면 이름을 반환하고, `Wrapper`가 Vue 인스턴스를 포함하지 않으면 DOM 노드의 태그 이름을 반환합니다.

- **반환값:** `{string}`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.name()).toBe('Foo')
const p = wrapper.find('p')
expect(p.name()).toBe('p')
```
