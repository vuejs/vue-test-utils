# `shallow(component {, options}])`

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

Аналогично [`mount`](mount.md), создаёт [`Wrapper`](wrapper/README.md), который содержит примонированный и отрендеренный компонент Vue, но с заглушками вместо дочерних компонентов.

**Без опций:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo)
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**С опциями Vue:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(wrapper.hasProp('color', 'red')).toBe(true)
  })
})
```

**Прикрепление к DOM:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo, {
      attachToDocument: true
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Слот по умолчанию и именованные слоты:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // будет соответствовать <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(wrapper.find('div')).toBe(true)
  })
})
```

**Заглушки глобальных свойств:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = shallow(Foo, {
      mocks: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).toBe($route.path)
  })
})
```
