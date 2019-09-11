## shallowMount()

- **Принимает:**

  - `{Component} component`
  - `{Object} options`
    - `{boolean} attachToDocument`
    - `{Object} context`
      - `{Array<Component|Object>|Component} children`
    - `{Object} slots`
      - `{Array<Component|Object>|Component|String} default`
      - `{Array<Component|Object>|Component|String} named`
    - `{Object} mocks`
    - `{Object|Array<string>} stubs`
    - `{Vue} localVue`

- **Возвращает:** `{Wrapper}`

- **Опции:**

См. [опции монтирования](./options.md)

- **Использование:**

Аналогично [`mount`](mount.md), создаёт [`Wrapper`](wrapper/), который содержит примонтированный и отрендеренный компонент Vue, но с заглушками вместо дочерних компонентов.

**Без опций:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('отрендерить div', () => {
    const wrapper = shallowMount(Foo)
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**С опциями Vue:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('отрендерить div', () => {
    const wrapper = shallowMount(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(wrapper.props().color).toBe('red')
  })
})
```

**Прикрепление к DOM:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('отрендерить div', () => {
    const wrapper = shallowMount(Foo, {
      attachToDocument: true
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Слот по умолчанию и именованные слоты:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('отрендерить div', () => {
    const wrapper = shallowMount(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // будет соответствовать <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Заглушки глобальных свойств:**

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('отрендерить div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = shallowMount(Foo, {
      mocks: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).toBe($route.path)
  })
})
```
