# shallow(component {, options}])

- **Argumentos:**

  - `{Component} component`
  - `{Object} options`
    - `{Boolean} attachToDocument`
    - `{Object} context`
    - `{Object} slots`
        - `{Array<Componet|Object>|Component|String} default`
        - `{Array<Componet|Object>|Component|String} named`
    - `{Object} mocks`
    - `{Object|Array<String>} stubs`
    - `{Object} children`
    - `{Vue} localVue`

- **Retorna:** `{Wrapper}`

- **Opções:**

Veja as [opçoes](./options.md)

- **Uso:**

Retorna um [`Wrapper`](wrapper/README.md) do primeiro elemento do DOM ou o componente Vue correspondente ao seletor.

Esboça todos os componentes filhos.

Use qualquer [seletor](selectors.md) válido.

**Sem opções:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('Renderiza uma div', () => {
    const wrapper = shallow(Foo)
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**With Vue options:**

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

**Anexa ao DOM:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('adiciona anexado ao DOM', () => {
    const wrapper = shallow(Foo, {
      attachToDocument: true
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Com slots padrões ou nomeados:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('adiciona slots ao componente', () => {
    const wrapper = shallow(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Corresponde a <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(wrapper.find('div')).toBe(true)
  })
})
```

**Adicionando propriedades globais:**

```js
import { shallow } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('adicionando mock global do $route', () => {
    const $route = { path: 'http://www.meusite.com.br' }
    const wrapper = shallow(Foo, {
      mocks: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).toBe($route.path)
  })
})
```
