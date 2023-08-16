## O método render()

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

- **Retorna:** `{Promise<CheerioWrapper>}`

- **Opções:**

Consulte as [opções](./options.md)

- **Uso:**

Transforma um objeto em uma string e retorna um [cheerio wrapper (envolvedor)](https://github.com/cheeriojs/cheerio).

Cheerio é uma biblioteca parecida com o JQuery para atravessar o DOM dentro do Node.js. Ela tem uma API semelhante ao [`Wrapper` (envolvedor)](wrapper/) da Vue Test Utils.

O `render` usa [`vue-server-renderer`](https://ssr.vuejs.org/en/basic.html) nos bastidores, para transformar um componente em HTML estático.

O `render` está incluído dentro do pacote `@vue/server-test-utils`.

**Sem as opções:**

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

**Com as opções do Vue:**

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

**Encaixes padrão e nomeados:**

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
        fooBar: FooBar, // Corresponderá a <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(wrapper.text()).toContain('<div></div>')
  })
})
```

**Forjando propriedades globais:**

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
