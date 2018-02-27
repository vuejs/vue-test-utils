# mount(component {, options}])

- **Argumentos:**

  - `{Component} component`
  - `{Object} options`

- **Retorna:** `{Wrapper}`

- **Opções:**

Veja [opções](options.md)

- **Uso:**

Retorna um [`Wrapper`](wrapper/README.md) do primeiro elemento do DOM ou o componente Vue correspondente ao seletor.

Use qualquer [seletor](selectors.md) válido.

**Sem opções:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('renderiza uma div', () => {
    const wrapper = mount(Foo)
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Com opções do Vue:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('verifica valor padrão da cor', () => {
    const wrapper = mount(Foo, {
      propsData: {
        cor: 'vermelha'
      }
    })
    expect(wrapper.hasProp('cor', 'vermelha')).toBe(true)
  })
})
```

**Anexar ao DOM:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('adiciona anexado ao DOM', () => {
    const wrapper = mount(Foo, {
      attachToDocument: true
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Com slots padrões ou nomeados:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import FooBar from './FooBar.vue'

describe('Foo', () => {
  it('registra slots padrões e nomeados', () => {
    const wrapper = mount(Foo, {
      slots: {
        default: [Bar, FooBar],
        fooBar: FooBar, // Corresponde a <slot name="FooBar" />,
        foo: '<div />'
      }
    })
    expect(wrapper.contains('div')).toBe(true)
  })
})
```

**Adicionando propriedades globais:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'

describe('Foo', () => {
  it('adicionando mock global do $route', () => {
    const $route = { path: 'http://www.meusite.com.br' }
    const wrapper = mount(Foo, {
      mocks: {
        $route
      }
    })
    expect(wrapper.vm.$route.path).toBe($route.path)
  })
})
```

**Esboçando componentes filhos:**

```js
import { mount } from '@vue/test-utils'
import Foo from './Foo.vue'
import Bar from './Bar.vue'
import Faz from './Faz.vue'

describe('Foo', () => {
  it('verifica componentes filhos de Foo', () => {
    const wrapper = mount(Foo, {
      stub: {
        Bar: '<div class="esbocado />',
        BarFoo: true,
        FooBar: Faz
      }
    })
    expect(wrapper.contains('.esbocado')).toBe(true)
    expect(wrapper.contains(Bar)).toBe(true)
  })
})
```

- **Veja também:** [Wrapper](wrapper/README.md)
