## renderToString()

- **Аргументы:**

  - `{Component} component`
  - `{Object} options`
    - `{Object} context`
      - `{Array<Component|Object>|Component} children`
    - `{Object} slots`
        - `{Array<Componet|Object>|Component|String} default`
        - `{Array<Componet|Object>|Component|String} named`
    - `{Object} mocks`
    - `{Object|Array<string>} stubs`
    - `{Vue} localVue`

- **Возвращает:** `{string}`

- **Опции:**

См. [опции](./options.md)

- **Использование:**

Рендерит компонент в HTML.

`renderToString` использует [`vue-server-renderer`](https://ssr.vuejs.org/en/basic.html) под капотом для рендеринга компонента в статический HTML.

`renderToString` включён в пакет `@vue/server-test-utils`.

**Без опций:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const renderedString = renderToString(Foo)
    expect(renderedString).toContain('<div></div>')
  })
})
```

**С опциями Vue:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const renderedString = renderToString(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(renderedString).toContain('red')
  })
})
```

**С слотами по умолчанию и именованными слотами:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const renderedString = renderToString(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Will match <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(renderedString).toContain('<div></div>')
  })
})
```

**Создание заглушек глобальных свойств:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', () => {
    const $route = { path: 'http://www.example-path.com' }
    const renderedString = renderToString(Foo, {
      mocks: {
        $route
      }
    })
    expect(renderedString).toContain($route.path)
  })
})
```