## render()

- **Принимает:**

  - `{Component} component`
  - `{Object} options`
    - `{Object} context`
      - `{Array<Component|Object>|Component} children`
    - `{Object} slots`
      - `{Array<Component|Object>|Component|String} default`
      - `{Array<Component|Object>|Component|String} named`
    - `{Object} mocks`
    - `{Object|Array<string>} stubs`
    - `{Vue} localVue`

- **Возвращает:** `{Promise<CheerioWrapper>}`

- **Опции:**

См. [опции](./options.md)

- **Использование:**

Рендерит объект в строку и возвращает [обёртку cheerio](https://github.com/cheeriojs/cheerio).

Cheerio — библиотека, похожая на jQuery, для навигации по DOM в Node.js. Она имеет аналогичный API в [`Wrapper`](wrapper/) Vue Test Utils.

`render` использует [`vue-server-renderer`](https://ssr.vuejs.org/en/basic.html) под капотом для рендеринга компонента в статический HTML.

`render` включён в пакет `@vue/server-test-utils`.

**Без опций:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const wrapper = await render(Foo)
    expect(wrapper.text()).toContain('<div></div>')
  })
})
```

**С опциями Vue:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const wrapper = await render(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(wrapper.text()).toContain('red')
  })
})
```

**Слоты по умолчанию и именованные слоты:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const wrapper = await render(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Будет соответствовать <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(wrapper.text()).toContain('<div></div>')
  })
})
```

**Создание заглушек глобальных свойств:**

```js
import { render } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const $route = { path: 'http://www.example-path.com' }
    const wrapper = await render(Foo, {
      mocks: {
        $route
      }
    })
    expect(wrapper.text()).toContain($route.path)
  })
})
```
