# update()

루트 Vue 컴포넌트를 재 렌더링합니다.

If called on a `Wrapper` containing a `vm`, it will force the `Wrapper` `vm` to re-render.
`vm`을 포함하는 `Wrapper`에서 호출되면, `Wrapper` `vm`을 강제로 다시 렌더링합니다.

- **예제:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.vm.bar).toBe('bar')
wrapper.vm.bar = 'new value'
wrapper.update()
expect(wrapper.vm.bar).toBe('new value')
```
