# setProps(props)

- **引数:**
  - `{Object} props`

- **使用方法:**

`Wrapper` `vm` プロパティを設定し更新を強制します。

**Wrapper には Vue インスタンスを含む必要があることに注意してください**


```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setProps({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')
```

渡された値で Vue インスタンス を初期化する `propsData` オブジェクトを渡すことができます。

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
