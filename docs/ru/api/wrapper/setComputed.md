# setComputed(computedProperties)

Устанавливает для `Wrapper` `vm` вычисляемое свойство и вызывает принудительное обновление.

**Wrapper должен содержать экземпляр Vue.**
**Экземпляр Vue должен уже содержать вычисляемые свойства, переданные в `setComputed`.**


- **Аргументы:**
  - `{Object} вычисляемые свойства`

- **Пример:**

```js
import { mount } from 'vue-test-utils'
import { expect } from 'chai'

const wrapper = mount({
  template: '<div>{{ computed1 }} {{ computed2 }}</div>',
  data () {
    return {
      initial: 'initial'
    }
  },
  computed: {
    computed1 () {
      return this.initial
    },
    computed2 () {
      return this.initial
    }
  }
})

expect(wrapper.html()).toBe('<div>initial initial</div>')

wrapper.setComputed({
  computed1: 'new-computed1',
  computed2: 'new-computed2'
})

expect(wrapper.html()).toBe('<div>new-computed1 new-computed2</div>')
```
