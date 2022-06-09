# Usando com a Vuex

Neste guia, iremos ver como testar a Vuex em componentes com a Vue Test Utils, e como testar uma memória da Vuex.

<div class="vueschool"><a href="https://vueschool.io/lessons/how-to-test-vuejs-component-with-vuex-store?friend=vuejs" target="_blank" rel="sponsored noopener" title="Aprenda como testar aquela memória da Vuex que é injetada dentro de um componente em uma aula em vídeo na Vue School">Aprenda como testar aquela memória da Vuex que é injetada dentro de um componente com Vue School</a></div>

## Testando a Vuex em componentes

### Imitando Ações

Vamos ver um pouco de código.

Isto é o componente que nós queremos testar. Ele chama as ações da Vuex.

```html
<template>
  <div class="text-align-center">
    <input type="text" @input="actionInputIfTrue" />
    <button @click="actionClick()">Click</button>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    methods: {
      ...mapActions(['actionClick']),
      actionInputIfTrue: function actionInputIfTrue(event) {
        const inputValue = event.target.value
        if (inputValue === 'input') {
          this.$store.dispatch('actionInput', { inputValue })
        }
      }
    }
  }
</script>
```

Para o propósito deste teste, nós não temos interesse no que as ações fazem, ou em como a memória se parece. Nós apenas precisamos saber que estas ações estão sendo disparadas quando elas deveriam, e que elas são disparadas com o valor esperado.

Para testar isto, nós precisamos passar uma imitação da memória para a Vue quando nós montamos superficialmente (shallowMount) o nosso componente.

Ao invés de passar a memória para o construtor base da Vue, nós podemos passar ela para um - [localVue](../api/options.md#localvue). Um localVue é um construtor isolado da Vue que nós podemos realizar mudanças sem afetar o construtor global da Vue.

Veremos que isto se parece:

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Actions from '../../../src/components/Actions'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Actions.vue', () => {
  let actions
  let store

  beforeEach(() => {
    actions = {
      actionClick: jest.fn(),
      actionInput: jest.fn()
    }
    store = new Vuex.Store({
      actions
    })
  })

  it('dispatches "actionInput" when input event value is "input"', () => {
    const wrapper = shallowMount(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'input'
    input.trigger('input')
    expect(actions.actionInput).toHaveBeenCalled()
  })

  it('does not dispatch "actionInput" when event value is not "input"', () => {
    const wrapper = shallowMount(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'not input'
    input.trigger('input')
    expect(actions.actionInput).not.toHaveBeenCalled()
  })

  it('calls store action "actionClick" when button is clicked', () => {
    const wrapper = shallowMount(Actions, { store, localVue })
    wrapper.find('button').trigger('click')
    expect(actions.actionClick).toHaveBeenCalled()
  })
})
```

O que está acontecendo aqui? Primeiro nós dizemos a Vue para usar a Vuex com o método `localVue`. Isto é apenas um envolvedor em volta da `Vue.use`.

Nós depois fazemos uma imitação da memória ao chamar `new Vuex.Store` com as nossas imitações de valores. Nós apenas passamos ela para as ações, visto que é tudo com o que nós nos preocupamos.

As ações são [funções de imitação da jest](https://jestjs.io/docs/en/mock-functions.html). Estas funções de imitação nos dão métodos para afirmar se as ações foram chamadas ou não.

Nós podemos então afirmar em nossos testes que a ação forjada foi chamada quando esperada.

Agora a maneira que nós definimos a memória pode parecer um pouco estranha para você.

Estamos usando `beforeEach` para garantir que nós temos uma memória limpa antes de cada teste. O `beforeEach` é um gatilho da mocha que é chamada antes de cada teste. No nosso teste, nós estamos re-atribuindo os valores das variáveis da memória. Se nós não fizéssemos isto, as funções de imitação precisariam ser automaticamente re-definidas. Ela também nos deixa mudar o estado em nossos testes, sem isto afetar os testes futuros.

A coisa mais importante a anotar neste teste é que **nós criamos uma imitação da memória da Vuex e depois passamos ela para a Vue Test Utils**.

Excelente, agora nós podemos imitar as ações, veremos em imitando os getters.

### Imitando os Getters

```html
<template>
  <div>
    <p v-if="inputValue">{{inputValue}}</p>
    <p v-if="clicks">{{clicks}}</p>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    computed: mapGetters(['clicks', 'inputValue'])
  }
</script>
```

Este é um componente razoavelmente simples. Ele renderiza o resultado dos getters `clicks` e `inputValue`. Novamente, nós não nos preocupamos com o que os getters retornam – apenas que seus resultados estão sendo renderizado corretamente.

Vejamos o teste:

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Getters from '../../../src/components/Getters'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Getters.vue', () => {
  let getters
  let store

  beforeEach(() => {
    getters = {
      clicks: () => 2,
      inputValue: () => 'input'
    }

    store = new Vuex.Store({
      getters
    })
  })

  it('Renders "store.getters.inputValue" in first p tag', () => {
    const wrapper = shallowMount(Getters, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(getters.inputValue())
  })

  it('Renders "store.getters.clicks" in second p tag', () => {
    const wrapper = shallowMount(Getters, { store, localVue })
    const p = wrapper.findAll('p').at(1)
    expect(p.text()).toBe(getters.clicks().toString())
  })
})
```

O teste é similar aos nossas ações de teste. Nós criamos uma imitação de memória antes de cada teste, passamos ele como uma opção quando nós chamamos `shallowMount`, e afirmar que o valor renderizado pela nossa imitação de getters está sendo renderizada.

Isto é genial, mas se nós quiséssemos verificar se nossos getters estão retornando a parte correta do nosso estado?

### Imitando com Módulos

Os [módulos](https://vuex.vuejs.org/guide/modules.html) são úteis para separação da nossa memória em pedaços gerenciáveis. Eles também exportam os getters. Nós podemos usar estes nos nossos testes.

Vejamos o nosso componente:

```html
<template>
  <div>
    <button @click="moduleActionClick()">Click</button>
    <p>{{moduleClicks}}</p>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'

  export default {
    methods: {
      ...mapActions(['moduleActionClick'])
    },

    computed: mapGetters(['moduleClicks'])
  }
</script>
```

Componente simples que inclui uma ação e o getter.

E o teste:

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import MyComponent from '../../../src/components/MyComponent'
import myModule from '../../../src/store/myModule'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('MyComponent.vue', () => {
  let actions
  let state
  let store

  beforeEach(() => {
    state = {
      clicks: 2
    }

    actions = {
      moduleActionClick: jest.fn()
    }

    store = new Vuex.Store({
      modules: {
        myModule: {
          state,
          actions,
          getters: myModule.getters,
          namespaced: true
        }
      }
    })
  })

  it('calls store action "moduleActionClick" when button is clicked', () => {
    const wrapper = shallowMount(MyComponent, { store, localVue })
    const button = wrapper.find('button')
    button.trigger('click')
    expect(actions.moduleActionClick).toHaveBeenCalled()
  })

  it('renders "state.clicks" in first p tag', () => {
    const wrapper = shallowMount(MyComponent, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(state.clicks.toString())
  })
})
```

### Testando uma Memória da Vuex

Existem duas abordagens para testes de uma memória da Vuex. A primeira abordagem é fazer testes unitários de getters, mutações, e ações separadamente. A segunda abordagem é criar uma memória e testar ela. Veremos ambas abordagens.

Para ver como testar uma memória da Vuex, iremos criar um simples memória de contador (counter). A memória terá uma mutação `increment` e um getter `evenOrOdd`.

```js
// mutations.js
export default {
  increment(state) {
    state.count++
  }
}
```

```js
// getters.js
export default {
  evenOrOdd: state => (state.count % 2 === 0 ? 'even' : 'odd')
}
```

### Testando getters, mutações, e ações separadamente

Os getters, mutações, e ações são todas funções de JavaScript, então nós podemos testar elas sem usar Vue Test Utils e Vuex.

O benefício de testar os getters, mutações, e ações separadamente é que seus testes unitários são detalhados. Quando eles falham, você sabe exatamente o que está errado com o seu código. A desvantagem é que você precisará imitar as funções de Vuex, como `commit` e o `dispatch`. Isto pode levar para uma situação em que seus testes unitários passam, mas seu código de produção falha porque suas imitações estão incorretas.

Criaremos dois ficheiros de teste, o `mutations.spec.js` e o `getters.spec.js`:

Primeiro, vamos testar as mutações de `increment`:

```js
// mutations.spec.js

import mutations from './mutations'

test('"increment" increments "state.count" by 1', () => {
  const state = {
    count: 0
  }
  mutations.increment(state)
  expect(state.count).toBe(1)
})
```

Agora vamos testar o getter `evenOrOdd`. Nós podemos testar ele ao criar uma imitação `state`, chamando o getter com o `state` e verificar se ele retorna o valor correto.

```js
// getters.spec.js

import getters from './getters'

test('"evenOrOdd" returns even if "state.count" is even', () => {
  const state = {
    count: 2
  }
  expect(getters.evenOrOdd(state)).toBe('even')
})

test('"evenOrOdd" returns odd if "state.count" is odd', () => {
  const state = {
    count: 1
  }
  expect(getters.evenOrOdd(state)).toBe('odd')
})
```

### Testando uma execução da memória

Um outra abordagem para testar uma memória da Vuex é criar uma execução da memória usando a configuração da memória.

O benefício da criação de uma instância de execução da memória é que nós não temos que imitar nenhuma função da Vuex.

A desvantagem é que quando um teste quebrar, pode ser difícil encontrar onde o problema está.

Vamos escrever um teste. Quando nós criamos uma memória, usaremos o `localVue` para evitar a poluição da base do construtor da Vue. O teste cria uma memória usando a exportação de `store-config.js`:

```js
// store-config.js

import mutations from './mutations'
import getters from './getters'

export default {
  state: {
    count: 0
  },
  mutations,
  getters
}
```

```js
// store-config.spec.js

import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import storeConfig from './store-config'
import { cloneDeep } from 'lodash'

test('increments "count" value when "increment" is committed', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  const store = new Vuex.Store(cloneDeep(storeConfig))
  expect(store.state.count).toBe(0)
  store.commit('increment')
  expect(store.state.count).toBe(1)
})

test('updates "evenOrOdd" getter when "increment" is committed', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  const store = new Vuex.Store(cloneDeep(storeConfig))
  expect(store.getters.evenOrOdd).toBe('even')
  store.commit('increment')
  expect(store.getters.evenOrOdd).toBe('odd')
})
```

Repare que nós usamos o `cloneDeep` para clonar a configuração da memória antes da criação uma memória com ela. Isto porque a Vuex realiza mutações nas opções do objeto usado para criar a memória. Para ter a certeza que nós temos uma memória limpa em cada teste, nós precisamos clonar o objeto `storeConfig`.

No entanto, o `cloneDeep` não é "profunda (deep)" o suficiente para também clonar os módulos da memória. Se a sua `storeConfig` incluírem os módulos, você precisará passar um objeto para `new Vuex.Store()`, deste jeito:

```js
import myModule from './myModule'
// ...
const store = new Vuex.Store({ modules: { myModule: cloneDeep(myModule) } })
```

### Recursos

- [Projeto de exemplo para testes de componentes](https://github.com/eddyerburgh/vue-test-utils-vuex-example)
- [Projeto de exemplo para testes da memória](https://github.com/eddyerburgh/testing-vuex-store-example)
- [`localVue`](../api/options.md#localvue)
- [`createLocalVue`](../api/createLocalVue.md)
