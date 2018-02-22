# Opções de mongatem

As opções são usadas nos métodos `mount` e `shallow`. O objeto de opções pode conter as opções de montagem do `vue-test-utils` e também as opções do Vue.

As opções do Vue são passadas para o componente quando uma nova instância é criada, por exemplo `store`, `propsData`. Para ver a lista completa de opções veja a [API do Vue](https://vuejs.org/v2/api/).

## Opções de montagem específicas do `vue-test-utils`

- [context](#context)
- [slots](#slots)
- [stubs](#stubs)
- [mocks](#mocks)
- [localVue](#localvue)
- [attachToDocument](#attachtodocument)
- [attrs](#attrs)
- [listeners](#listeners)

### `context`

- tipo: `Object`

Passa o contexto ao componente funcional. Só pode ser usado com componentes funcionais.

Exemplo:

```js
const wrapper = mount(Componente, {
  context: {
    props: { show: true }
  }
})

expect(wrapper.is(Componente)).toBe(true)
```

### `slots`

- tipo: `{ [name: String]: Array<Component>|Component|String }`

Forneça um objeto do slot para o componente. A chave corresponde ao nome do slot. O valor pode ser um componentem um Array de componentes ou uma template String.

Exemplo:

```js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Component, {
  slots: {
    default: [Foo, Bar],
    fooBar: Foo, // Corresponde a <slot name="FooBar" />,
    foo: '<div />'
  }
})
expect(wrapper.find('div')).toBe(true)
```

### Esboços

- tipo: `{ [name: String]: Component | Boolean } | Array<String>`

Esboça os componentes filhos. Pode ser um Array com os nomes dos componentes  ou um objeto.

Exemplo:

```js
import Foo from './Foo.vue'

mount(Component, {
  stubs: ['componente-registrado']
})

shallow(Component, {
  stubs: {
    // esboço com uma implementação específica
    'componente-registrado': Foo,
    // criar um esboço padrão (simulado com mock)
    'outro componente': true
  }
})
```

### `mocks`

- tipo: `Object`

Adiciona uma propriedade adicional à instância. Ótimo para simular injeções globais.

Exemplo:

```js

const $route = { path: 'http://www.meusite.com.br' }
const wrapper = shallow(Component, {
  mocks: {
    $route
  }
})
expect(wrapper.vm.$route.path).toBe($route.path)
```

### `localVue`

- tipo: `Vue`

Uma cópia local do Vue é criada pelo [createLocalVue](./createLocalVue.md) para usar quando for montar um componente. A instalação de plugins e outros nessa cópia previne que seu Vue original seja poluído.

Exemplo:

```js
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

const routes = [
  { path: '/foo', component: Foo }
]

const router = new VueRouter({
  routes
})

const wrapper = mount(Component, {
  localVue,
  router
})
expect(wrapper.vm.$route).toBeInstanceOf(Object)
```

### `attachToDocument`

- tipo: `Boolean`
- padrão: `false`

O componente será anexado ao DOM quando  configurado como `true`. Isso pode ser usado com o [`hasStyle`](wrapper/hasStyle.md) para verificar os seletores do CSS de vários elementos.

### `attrs`

- tipo: `Object`

Define o objeto `$attrs` da instância do componente.

### `listeners`

- tipo: `Object`

Define o objeto `$listeners` da instância do componente.
