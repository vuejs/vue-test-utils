# createLocalVue()

- **반환값:**
  - `{Component}`

- **사용법:**

`createLocalVue`는 글로벌 Vue 클래스를 더럽히지 않고 컴포넌트, 믹스인 그리고 플러그인을 추가할 수 있는 Vue 클래스를 반환합니다.

`options.localVue`로 사용합니다.

```js
import { createLocalVue, shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

const localVue = createLocalVue()
const wrapper = shallow(Foo, {
  localVue,
  mocks: { foo: true }
})
expect(wrapper.vm.foo).toBe(true)

const freshWrapper = shallow(Foo)
expect(freshWrapper.vm.foo).toBe(false)
```

- **함께 보기:** [일반적인 팁](../guides/common-tips.md#applying-global-plugins-and-mixins)
