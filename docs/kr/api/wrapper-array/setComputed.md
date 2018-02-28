
# setComputed(computedObjects)

`WrapperArray`의 모든 `Wrapper` `vm`의 계산된 속성을 갱신합니다.

**참고: Wrapper는 Vue 인스턴스를 반드시 가지고 있어야합니다.**
**참고: 모든 Vue 인스턴스는 이미 setComputed로 계산된 속성이 설정되어있어야 합니다.**

- **전달인자:**
  - `{Object} computed properties`

- **예제:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Foo)
const barArray = wrapper.findAll(Bar)

barArray.setComputed({
  computed1: 'new-computed1',
  computed2: 'new-computed2'
})
```
