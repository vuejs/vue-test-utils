# update()

강제로 루트 Vue 컴포넌트를 재 렌더링합니다.

`vm`을 포함하는 `Wrapper`에서 호출되면, `Wrapper` `vm`을 강제로 다시 렌더링합니다.

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
expect(wrapper.vm.bar).toBe('bar')
wrapper.vm.bar = 'new value'
wrapper.update()
expect(wrapper.vm.bar).toBe('new value')
```
