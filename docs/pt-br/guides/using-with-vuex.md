# Usando com o Vuex

Nesse guia verems como testar o Vuex nos componentes com o `vue-test-utils`.

## Mockando ações

Vejamos algum código...

Esse é o componente que queremos testar. Ele chama ações do Vuex.

``` html
<template>
    <div class="text-align-center">
      <input type="text" @input="acaoSeVerdade" />
      <button @click="acaoDeClique()">Clique</button>
    </div>
</template>

<script>
import { mapActions } from 'vuex'

export default{
  methods: {
    ...mapActions([
      'acaoDeClique'
    ]),
    acaoSeVerdade: function (event) {
      const valorInput = event.target.value
      if (valorInput === 'input') {
        this.$store.dispatch('acaoInput', { valorInput })
      }
    }
  }
}
</script>
```

Para os fins desse teste, não nos importa o que cada ação do Vuex faz ou como a store é criada. Nos precisamos apenas saber que essas ações estão sendo disparadas quando deveriam, e que elas são disparadas com os valores esperados.

Para testar isso, precisamos passar um mock da store para o Vue quando envelopamos nosso componente.

Em vez de passar a store para o construtor do Vue, nós passamos um [localVue](../api/options.md#localvue). Um localVue é um construtor local do Vue com escopo que permite alterações sem afetar o construtor global.

Vamos ver como isso se apreenta no código:

``` js
import { shallow, createLocalVue } from 'vue-test-utils'
import Vuex from 'vuex'
import Acoes from '../../../src/componentes/Acoes'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Acoes.vue', () => {
  let acoes
  let store

  beforeEach(() => {
    acoes = {
      acaoDeClique: jest.fn(),
      acaoInput: jest.fn()
    }

    store = new Vuex.Store({
      state: {},
      acoes
    })
  })

  it('chama a ação acaoInput da store quando o valor do input é inserido e um evento do input é disparado', () => {
    const wrapper = shallow(Acoes, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'input'
    input.trigger('input')
    expect( acoes.acaoInput ).toHaveBeenCalled()
  })

  it('não liga a ação acaoInput da store quando o valor do input não é inserido e um evento do input é disparado', () => {
    const wrapper = shallow(Acoes, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'not input'
    input.trigger('input')
    expect( acoes.acaoInput ).not.toHaveBeenCalled()
  })

  it('calls store action actionClick when button is clicked', () => {
    const wrapper = shallow(Actions, { store, localVue })
    wrapper.find('button').trigger('click')
    expect(actions.actionClick).toHaveBeenCalled()
  })
})
```

O que está acontecendo aqui? Primeiro contamos ao localVue que ele usará o Vuex no método `localVue.use`. Este é apenas um embrulho do `Vue.use`.

Em seguida, fazemos uma store mockada chamando o método `Vuex.Store` com os valores do mock. Nós apenas passamos as ações, já que é o que nos importa no momento.

The actions are [jest mock functions](https://facebook.github.io/jest/docs/en/mock-functions.html). These mock functions give us methods to assert whether the actions were called or not.

We can then assert in our tests that the action stub was called when expected.

Now the way we define the store might look a bit foreign to you.

We’re using `beforeEach` to ensure we have a clean store before each test. `beforeEach` is a mocha hook that’s called before each test. In our test, we are reassigning the store variables value. If we didn’t do this, the mock functions would need to be automatically reset. It also lets us change the state in our tests, without it affecting later tests.

The most important thing to note in this test is that **we create a mock Vuex store and then pass it to vue-test-utils**.

Great, so now we can mock actions, let’s look at mocking getters.

## Mocking Getters


``` html
<template>
    <div>
      <p v-if="inputValue">{{inputValue}}</p>
      <p v-if="clicks">{{clicks}}</p>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default{
  computed: mapGetters([
    'clicks',
    'inputValue'
  ])
}
</script>
```

This is a fairly simple component. It renders the result of the getters `clicks` and `inputValue`. Again, we don’t really care about what those getters returns – just that the result of them is being rendered correctly.

Let’s see the test:

``` js
import { shallow, createLocalVue } from 'vue-test-utils'
import Vuex from 'vuex'
import Actions from '../../../src/components/Getters'

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

  it('Renders state.inputValue in first p tag', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(getters.inputValue())
  })

  it('Renders state.clicks in second p tag', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const p = wrapper.findAll('p').at(1)
    expect(p.text()).toBe(getters.clicks().toString())
  })
})
```
This test is similar to our actions test. We create a mock store before each test, pass it as an option when we call `shallow`, and assert that the value returned by our mock getters is being rendered.

This is great, but what if we want to check our getters are returning the correct part of our state?

## Mocking with Modules

[Modules](https://vuex.vuejs.org/en/modules.html) are useful for separating out our store into manageable chunks. They also export getters. We can use these in our tests.

Let’s look at our component:

``` html
<template>
  <div>
    <button @click="moduleActionClick()">Click</button>
    <p>{{moduleClicks}}</p>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default{
  methods: {
    ...mapActions([
      'moduleActionClick'
    ])
  },

  computed: mapGetters([
    'moduleClicks'
  ])
}
</script>
```
Simple component that includes one action and one getter.

And the test:

``` js
import { shallow, createLocalVue } from 'vue-test-utils'
import Vuex from 'vuex'
import Modules from '../../../src/components/Modules'
import module from '../../../src/store/module'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Modules.vue', () => {
  let actions
  let state
  let store

  beforeEach(() => {
    state = {
      module: {
        clicks: 2
      }
    }

    actions = {
      moduleActionClick: jest.fn()
    }

    store = new Vuex.Store({
      state,
      actions,
      getters: module.getters
    })
  })

  it('calls store action moduleActionClick when button is clicked', () => {
    const wrapper = shallow(Modules, { store, localVue })
    const button = wrapper.find('button')
    button.trigger('click')
    expect(actions.moduleActionClick).toHaveBeenCalled()
  })

  it('Renders state.inputValue in first p tag', () => {
    const wrapper = shallow(Modules, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(state.module.clicks.toString())
  })
})
```

### Resources

- [Example project for this guide](https://github.com/eddyerburgh/vue-test-utils-vuex-example)
- [localVue](../api/options.md#localvue)
- [createLocalVue](../api/createLocalVue.md)
