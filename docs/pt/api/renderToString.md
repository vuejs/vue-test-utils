## O método renderToString()

- **Argumentos:**

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

- **Retorna:** `{Promise<string>}`

- **Opções:**

Consulte as [opções](./options.md)

- **Uso:**

Transforma um componente em HTML.

O `renderToString` usa o [`vue-server-renderer`](https://ssr.vuejs.org/en/basic.html) nos bastidores, para transformar um componente em HTML.

O `renderToString` está incluído dentro do pacote `@vue/server-test-utils`.

**Sem as opções:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const str = await renderToString(Foo)
    expect(str).toContain('<div></div>')
  })
})
```

**Com as opções do Vue:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const str = await renderToString(Foo, {
      propsData: {
        color: 'red'
      }
    })
    expect(str).toContain('red')
  })
})
```

**Encaixes padrão e nomeados:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const str = await renderToString(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Corresponderá a <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(str).toContain('<div></div>')
  })
})
```

**Forjando propriedades globais:**

```js
import { renderToString } from '@vue/server-test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renders a div', async () => {
    const $route = { path: 'http://www.example-path.com' }
    const str = await renderToString(Foo, {
      mocks: {
        $route
      }
    })
    expect(str).toContain($route.path)
  })
})
```
