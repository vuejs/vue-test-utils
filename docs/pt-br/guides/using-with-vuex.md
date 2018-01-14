# Usando com o Vuex

Nesse guia verems como testar o Vuex nos componentes com o `vue-test-utils`.

## Simulando ações

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
import { shallow, createLocalVue } from '@vue/test-utils'
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
    expect(acoes.acaoInput).toHaveBeenCalled()
  })

  it('não liga a ação acaoInput da store quando o valor do input não é inserido e um evento do input é disparado', () => {
    const wrapper = shallow(Acoes, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'not input'
    input.trigger('input')
    expect(acoes.acaoInput).not.toHaveBeenCalled()
  })

  it('calls store action actionClick when button is clicked', () => {
    const wrapper = shallow(Actions, { store, localVue })
    wrapper.find('button').trigger('click')
    expect(actions.actionClick).toHaveBeenCalled()
  })
})
```

O que está acontecendo aqui? Primeiro contamos ao localVue que ele usará o Vuex no método `localVue.use`. Este é apenas um wrapper do `Vue.use`.

Em seguida, fazemos uma store simulada chamando o método `Vuex.Store` com os valores do mock. Nós apenas passamos as ações, já que é o que nos importa no momento.

As ações são [funções de mock do Jest](https://facebook.github.io/jest/docs/en/mock-functions.html). Essas funções simuladas nos dão alguns métodos para verificar se as determinadas ações foram ou não chamadas.

Então, podemos fazer a asserção nos nossos testes esperando que essas ações do Vuex foram chamadas no momento esperado.

A forma como definimos a store pode parecer um pouco estranha para você.

Nós usamos o `beforeEach` para garantir que teremos uma store limpa antes de cada teste. O `beforeEach` é um método gancho do Mocha que é chamado antes de cada teste. Em nosso teste, reatribuímos os valores da store. Se nós não fizessemos isso, as funções simuladas deveriam ser reiniciadas automaticamente. Esse método também permite que alteremos o estado nos testes sem que afete os testes posteriores, pois ele será redefinido entre esses testes.

A coisa mais impotante a ser notada neste teste é que **criamos um mock da store e depois passamos ela para o vue-test-utils**.

Ótimo, agora que nós já conseguimos simular as actions, vamos ver como simular o getters.

## Simulando os getters

``` html
<template>
    <div>
      <p v-if="valorDoInput">{{valorDoInput}}</p>
      <p v-if="cliques">{{cliques}}</p>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default{
  computed: mapGetters([
    'cliques',
    'valorDoInput'
  ])
}
</script>
```

Esse é um componente bastante simples, Ele mostra os resultados capturados pelos getters `cliques` e `valorDoInput`. Mais um vez, nós não importamos com o que esses getters retornam e o que fazem no seu interior, mas sim com o resultado que ele acarretará no componente a ser testado.

Valos ver o teste do componente:

``` js
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import GettersComponente from '../../../src/componentes/GettersComponente'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('GettersComponente.vue', () => {
  let getters
  let store

  beforeEach(() => {
    getters = {
      cliques: () => 2,
      valorDoInput: () => 'input'
    }

    store = new Vuex.Store({
      getters
    })
  })

  it('Renderiza o valor do input na primeira tag P', () => {
    const wrapper = shallow(GettersComponente, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(getters.valorDoInput())
  })

  it('Renderiza o valor de cliques na segunda tag P', () => {
    const wrapper = shallow(GettersComponente, { store, localVue })
    const p = wrapper.findAll('p').at(1)
    expect(p.text()).toBe(getters.cliques().toString())
  })
})
```

Esse teste é bastante similar com nosso teste de actions. Criamos um mock da store antes de cada teste, passamos ele como uma opção do método `shallow`, e verificamos o valor retornado pelo getter, verificando se o mesmo foi renderizado no template do componente.

Isso é ótimo, mas se quisermos garantir que nossos getters estão retornando a parte correta do nosso state?

## Criando mocks com módulos

Os [módulos](https://vuex.vuejs.org/en/modules.html) são úteis para separar nossa store em partes gerenciáveis. Podemos usa-los em nossos testes.

Dê uma olhada nesse nosso componente:

``` html
<template>
  <div>
    <button @click="cliqueEmModulo()">Clique</button>
    <p>{{cliquesModulo}}</p>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default{
  methods: {
    ...mapActions([
      'cliqueEmModulo'
    ])
  },

  computed: mapGetters([
    'cliquesModulo'
  ])
}
</script>
```

Esse simples componente incluí uma ação e um getter.

E seu teste fica assim:

``` js
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import ModuloComponente from '../../../src/componentes/ModuloComponente'
import modulo from '../../../src/store/modulo'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('ModuloComponente.vue', () => {
  let actions
  let state
  let store

  beforeEach(() => {
    state = {
      modulo: {
        cliques: 2
      }
    }

    actions = {
      cliqueEmModulo: jest.fn()
    }

    store = new Vuex.Store({
      state,
      actions,
      getters: modulo.getters
    })
  })

  it('chama a ação cliqueEmModulo quand o botão é clicado', () => {
    const wrapper = shallow(ModuloComponente, { store, localVue })
    const button = wrapper.find('button')
    button.trigger('click')
    expect(actions.cliqueEmModulo).toHaveBeenCalled()
  })

  it('Renderiza os cliques do state do módulo no primeiro P', () => {
    const wrapper = shallow(ModuloComponente, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(state.modulo.cliques.toString())
  })
})
```

### Recursos

- [Projeto de exemplo com essa configuração](https://github.com/eddyerburgh/vue-test-utils-vuex-example)
- [localVue](../api/options.md#localvue)
- [createLocalVue](../api/createLocalVue.md)
