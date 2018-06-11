# props()

Возвращает объект с входными параметрами `vm` для `Wrapper`.

**Обратите внимание что Wrapper должен содержать экземпляр Vue.**

- **Возвращает:** `{[prop: string]: any}`

- **Пример:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

const wrapper = mount(Foo, {
  propsData: {
    bar: 'baz'
  }
})
expect(wrapper.props().bar).toBe('baz')
```