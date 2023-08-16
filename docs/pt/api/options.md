# Opções de Montagem

Opções para o método `mount` e `shallowMount`.

:::tip
Além das opções documentadas abaixo, o objeto `options` pode conter qualquer opção que seria válida dentro de uma chamada para `new Vue({ /* as opções vão aqui */ })`.
Essas opções será combinada com as opções do componente existente quando montada com o método `mount` ou `shallowMount`

[Consulte outras opções para exemplos](#outras-opções)
:::

- [Opções de Montagem](#opções-de-montagem)
  - [A propriedade context](#a-propriedade-context)
  - [A propriedade data](#a-propriedade-data)
  - [A propriedade slots](#a-propriedade-slots)
  - [A propriedade scopedSlots](#a-propriedade-scopedslots)
  - [A propriedade stubs](#a-propriedade-stubs)
  - [A propriedade mocks](#a-propriedade-mocks)
  - [A propriedade localVue](#a-propriedade-localvue)
  - [A propriedade attachTo](#a-propriedade-attachto)
  - [A propriedade attachToDocument](#a-propriedade-attachtodocument)
  - [A propriedade attrs](#a-propriedade-attrs)
  - [A propriedade propsData](#a-propriedade-propsdata)
  - [A propriedade listeners](#a-propriedade-listeners)
  - [A propriedade parentComponent](#a-propriedade-parentcomponent)
  - [A propriedade provide](#a-propriedade-provide)
  - [Outras opções](#outras-opções)

## A propriedade context

- Tipo: `Object`

Passa o contexto para um componente funcional. Apenas pode ser usado com [componentes funcionais](https://vuejs.org/v2/guide/render-function.html#Functional-Components).

Exemplo:

```js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Component, {
  context: {
    props: { show: true },
    children: [Foo, Bar]
  }
})

expect(wrapper.is(Component)).toBe(true)
```

## A propriedade data

- Tipo: `Function`

Passa os dados para um componente. Será combinada com a função `data` existente.

Exemplo:

```js
const Component = {
  template: `
    <div>
      <span id="foo">{{ foo }}</span>
      <span id="bar">{{ bar }}</span>
    </div>
  `,

  data() {
    return {
      foo: 'foo',
      bar: 'bar'
    }
  }
}

const wrapper = mount(Component, {
  data() {
    return {
      bar: 'my-override'
    }
  }
})

wrapper.find('#foo').text() // 'foo'
wrapper.find('#bar').text() // 'my-override'
```

## A propriedade slots

- Tipo: `{ [name: string]: Array<Component>|Component|string }`

Fornece um objeto de encaixe de conteúdo para um componente. A chave corresponde ao nome do encaixe. O valor pode ser tanto um componente, um arranjo de componentes, ou um modelo de sequência de caracteres, ou texto.

Exemplo:

```js
import Foo from './Foo.vue'
import MyComponent from './MyComponent.vue'

const bazComponent = {
  name: 'baz-component',
  template: '<p>baz</p>'
}

const yourComponent = {
  props: {
    foo: {
      type: String,
      required: true
    }
  },
  render(h) {
    return h('p', this.foo)
  }
}

const wrapper = shallowMount(Component, {
  slots: {
    default: [Foo, '<my-component />', 'text'],
    fooBar: Foo, // Corresponderá a `<slot name="FooBar" />`.
    foo: '<div />',
    bar: 'bar',
    baz: bazComponent,
    qux: '<my-component />',
    quux: '<your-component foo="lorem"/><your-component :foo="yourProperty"/>'
  },
  stubs: {
    // usado para registar componentes personalizados
    'my-component': MyComponent,
    'your-component': yourComponent
  },
  mocks: {
    // usado para adicionar propriedades para o contexto de renderização
    yourProperty: 'ipsum'
  }
})

expect(wrapper.find('div')).toBe(true)
```

## A propriedade scopedSlots

- Tipo: `{ [name: string]: string|Function }`

Fornece um objeto de encaixes escopados ao componente. A chave responde ao nome do encaixe.

Você pode definir o nome das propriedades com o uso do atributo `slot-scope`:

```js
shallowMount(Component, {
  scopedSlots: {
    foo: '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>'
  }
})
```

Otherwise props are available as a `props` object when the slot is evaluated:
De outro modo as propriedades estarão disponíveis como um objeto `props` quando o encaixe for avaliado:

```js
shallowMount(Component, {
  scopedSlots: {
    default: '<p>{{props.index}},{{props.text}}</p>'
  }
})
```

You can also pass a function that takes the props as an argument:
Você pode também passar uma função que recebem as propriedades como um argumento:

```js
shallowMount(Component, {
  scopedSlots: {
    foo: function(props) {
      return this.$createElement('div', props.index)
    }
  }
})
```

Ou você pode usar JSX. Se você escrever em JSX dentro de um método, o `this.$createElement` é injetado automaticamente pelo `babel-plugin-transform-vue-jsx`:

```js
shallowMount(Component, {
  scopedSlots: {
    foo(props) {
      return <div>{props.text}</div>
    }
  }
})
```

::: warning Elemento Raíz Obrigatório
Devido a implementação interna desta funcionalidade, o encaixe de conteúdo tem de retornar um elemento raíz, mesma a um encaixe escopado é permitido retornar um arranjo de elementos.

Se você alguma vez precisar disto em um teste, a maneira recomendada para dar a volta a isso é envolver o componente em teste dentro de outro componente e montar esse:
:::

```js
const WrapperComp = {
  template: `
  <ComponentUnderTest v-slot="props">
    <p>Using the {{props.a}}</p>
    <p>Using the {{props.a}}</p>
  </ComponentUnderTest>
  `,
  components: {
    ComponentUnderTest
  }
}
const wrapper = mount(WrapperComp).findComponent(ComponentUnderTest)
```

## A propriedade stubs

- Tipo: `{ [name: string]: Component | string | boolean } | Array<string>`

Forja componentes filhos que podem estar em um arranjo de nomes de componentes para forjar, ou em um objeto. Se a propriedade `stubs` for um arranjo, todo elemento forjado é um `<${component name}-stub>`.

**Aviso de Depreciação:**

Quando estiver forjando componentes, o fornecimento de uma sequência de caracteres (`ComponentToStub: '<div class="stubbed" />`) não é mais suportado.

Exemplo:

```js
import Foo from './Foo.vue'

mount(Component, {
  stubs: ['registered-component']
})

shallowMount(Component, {
  stubs: {
    // forja com uma implementação específica
    'registered-component': Foo,
    // cria um forjado padrão.
    // neste caso o nome do componente de um forjado padrão é `another-component`.
    // o forjado padrão é `<${the component name of default stub}-stub>`.
    'another-component': true
  }
})
```

## A propriedade mocks

- Tipo: `Object`

Adiciona propriedades adicionais à instância. Útil para moldar injeções globais.

Exemplo:

```js
const $route = { path: 'http://www.example-path.com' }
const wrapper = shallowMount(Component, {
  mocks: {
    $route
  }
})
expect(wrapper.vm.$route.path).toBe($route.path)
```

::: tip
Para moldar o `$root` use a opção `parentComponent` como descrita [aqui](https://github.com/vuejs/vue-test-utils/issues/481#issuecomment-423716430)
:::

## A propriedade localVue

- Tipo: `Vue`

Uma cópia local de Vue criada pelo método [`createLocalVue`](./createLocalVue.md) para usar quando estiver montando o componente. Instalar plugins sobre esta cópia de `Vue` impedi a polução da cópia original de `Vue`.

Exemplo:

```js
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

const routes = [{ path: '/foo', component: Foo }]

const router = new VueRouter({
  routes
})

const wrapper = mount(Component, {
  localVue,
  router
})
expect(wrapper.vm.$route).toBeInstanceOf(Object)
```

## A propriedade attachTo

- Tipo: `HTMLElement | string`
- Valor padrão: `null`

Isto especifica um `HTMLElement` específico ou sequência de caracteres de seletor CSS apontando um `HTMLElement`, para qual o seu componente será completamente montado dentro do documento. 

Quando estiver ligando ao DOM, você deve chamar o `wrapper.destroy()` no final do seu teste para remover os elementos renderizados do documento e destruir a instância do componente.

::: tip
Quando estiver usando o `attachTo: document.body` o novo `div` ao invés de substituir o corpo inteiro, o novo `<div>` será adicionado. Isto foi desenhado para imitar o comportamento do Vue 3 e simplificar a futura migração. Para mais detalhes consulte [este comentário](https://github.com/vuejs/vue-test-utils/issues/1578#issuecomment-674652747)
:::

```js
const div = document.createElement('div')
div.id = 'root'
document.body.appendChild(div)

const Component = {
  template: '<div>ABC</div>'
}
let wrapper = mount(Component, {
  attachTo: '#root'
})
expect(wrapper.vm.$el.parentNode).not.toBeNull()
wrapper.destroy()

wrapper = mount(Component, {
  attachTo: document.getElementById('root')
})
expect(wrapper.vm.$el.parentNode).not.toBeNull()
wrapper.destroy()
```

## A propriedade attachToDocument

- Tipo: `boolean`
- Valor padrão: `false`

::: warning Aviso de Depreciação
A propriedade `attachToDocument` está depreciada e será removida nos futuros lançamentos. Use o [`attachTo`](#a-propriedade-attachto) no lugar. Por exemplo, se você precisar ligar o componente ao `document.body`:

```js
wrapper = mount(Component, {
  attachTo: document.body
})
```

Para mais informações, consulte a dica do [`attachTo`](#a-propriedade-attachto) acima.
:::

Tal como o [`attachTo`](#a-propriedade-attachto), porém ele cria automaticamente um novo elemento `div` por você e insere ele dentro do seu corpo.

Quando estiver ligando ao DOM, você deve chamar o `wrapper.destroy()` no final do seu teste para remover os elementos renderizados do documento e destruir a instância do componente.

## A propriedade attrs

- Tipo: `Object`

Define o objeto `$attrs` da instância do componente.

## A propriedade propsData

- Tipo: `Object`

Define as propriedades da instância do componente quando o componente estiver montado.

Exemplo:

```js
const Component = {
  template: '<div>{{ msg }}</div>',
  props: ['msg']
}
const wrapper = mount(Component, {
  propsData: {
    msg: 'aBC'
  }
})
expect(wrapper.text()).toBe('aBC')
```

::: tip
É digno de menção que o `propsData` é de fato uma [API do Vue](https://vuejs.org/v2/api/#propsData), não uma opção de montagem do Vue Test Utils.
:::

## A propriedade listeners

- Tipo: `Object`

Define o objeto `$listeners` da instância do componente.

Exemplo:

```js
const Component = {
  template: '<button v-on:click="$emit(\'click\')"></button>'
}
const onClick = jest.fn()
const wrapper = mount(Component, {
  listeners: {
    click: onClick
  }
})

wrapper.trigger('click')
expect(onClick).toHaveBeenCalled()
```

## A propriedade parentComponent

- Tipo: `Object`

O componente para ser usado como pai para o componente montado.

Exemplo:

```js
import Foo from './Foo.vue'

const wrapper = shallowMount(Component, {
  parentComponent: Foo
})
expect(wrapper.vm.$parent.$options.name).toBe('foo')
```

## A propriedade provide

- Tipo: `Object`

Passa as propriedades para os componentes usarem na injeção. Consulte o [provide/inject](https://vuejs.org/v2/api/#provide-inject).

Exemplo:

```js
const Component = {
  inject: ['foo'],
  template: '<div>{{this.foo()}}</div>'
}

const wrapper = shallowMount(Component, {
  provide: {
    foo() {
      return 'fooValue'
    }
  }
})

expect(wrapper.text()).toBe('fooValue')
```

## Outras opções

Quando as opções para o método `mount` e `shallowMount` contém as opções, outras opções para além das opções de montagem, as opções do componente são sobrescritas por aquelas usando o [extends](https://vuejs.org/v2/api/#extends).

```js
const Component = {
  template: '<div>{{ foo }}</div>',
  data() {
    return {
      foo: 'fromComponent'
    }
  }
}
const options = {
  data() {
    return {
      foo: 'fromOptions'
    }
  }
}

const wrapper = mount(Component, options)

expect(wrapper.text()).toBe('fromOptions')
```
