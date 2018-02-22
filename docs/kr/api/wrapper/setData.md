# setData(data)

`Wrapper` `vm`의 데이터를 갱신합니다.

**참고: Wrapper는 Vue 인스턴스를 반드시 가지고 있어야합니다.**

- **전달인자:**
  - `{Object} data`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setData({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')
```
