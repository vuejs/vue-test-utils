# setProps(props)

`WrapperArray`의 모든 `Wrapper` `vm`의 `props`를 갱신합니다.

**참고: Wrapper는 Vue 인스턴스를 반드시 가지고 있어야합니다.**

- **전달인자:**
  - `{Object} props`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import { expect } from 'chai'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)
barArray.setProps({ foo: 'bar' })
expect(barArray.at(0).vm.foo).toBe('bar')
```
