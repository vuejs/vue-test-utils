## props()

Возвращает объект с входными параметрами `vm` для `Wrapper`. Если `key` передан, метод вернёт значения свойства с именем `key`.

**Обратите внимание что Wrapper должен содержать экземпляр Vue.**

- **Принимает:**

  - `{string} key` **опционально**

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
expect(wrapper.props('bar')).toBe('baz')
```
