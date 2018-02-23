# setProps(props)

- **전달인자:**
  - `{Object} props`

- **사용법:**

`Wrapper` `vm` props를 갱신합니다.

**참고: Wrapper는 Vue 인스턴스를 반드시 가지고 있어야합니다.**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setProps({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')
```

전달받은 값으로 Vue 인스턴스를 초기화하는 `propsData` 객체를 전달할 수 있습니다.

``` js
// Foo.vue
export default {
  props: {
    foo: {
      type: String,
      required: true
    }
  }
}
```

``` js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo, {
  propsData: {
    foo: 'bar'
  }
})

expect(wrapper.vm.foo).toBe('bar')
```
