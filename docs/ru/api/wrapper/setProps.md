# setProps(props)

- **Принимает:**
  - `{Object} props`

- **Использование:**

Устанавливает входные параметры `Wrapper` `vm` и выполняет принудительное обновление.

**Обратите внимание, что `Wrapper` должен содержать экземпляр Vue.**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo)
wrapper.setProps({ foo: 'bar' })
expect(wrapper.vm.foo).toBe('bar')
```

Вы также можете передать объект `propsData`, который инициализирует экземпляр Vue с переданными значениями.

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