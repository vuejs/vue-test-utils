# Utilisation avec Vuex

Dans ce guide, nous verrons comme tester Vuex dans les composants avec Vue Test Utils, et comment aborder le test d'un sore de Vuex.

<div class="vueschool"><a href="https://vueschool.io/lessons/how-to-test-vuejs-component-with-vuex-store?friend=vuejs" target="_blank" rel="sponsored noopener" title="Learn how to test that a Vuex Store is injected into a component with a free video lesson on Vue School">Apprenez comment tester qu'un store de Vuex est injecté dans un composant avec Vue School</a></div>

## Tester Vuex dans les composants

### Simulation des Actions

Regardons un peu de code.

C'est le composant que nous voulons tester. Il appelle les actions de Vuex.

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

Pour les besoins de ce test, nous ne soucions pas de l’effet des actions, ni de l’aspect du store. Nous devons juste savoir que ces actions sont lancées au moment opportun et qu’elles sont lancées avec la valeur attendue.

Pour tester cela, nous devons faire passer un store fictif à Vue lorsque nous montons notre composant avec `shallowMount`.

Au lieu de passer le store au constructeur de base de Vue, nous pouvons le passer à - [localVue](../api/options.md#localvue). Un localVue est un constructeur de Vue étendu que nous pouvons modifier sans affecter le constructeur de Vue global.

Voyons à quoi cela ressemble :

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

Que se passe-t-il ici ? Tout d'abord, nous disons à Vue d'utiliser Vuex avec la méthode `localVue.use`. C'est juste un emballage autour de `Vue.use`.

Nous faisons ensuite un magasin fictif en appelant `new Vuex.Store` avec nos valeurs fictives. Nous lui transmettons seulement les actions, puisque c'est tout ce qui nous intéresse.

Les actions sont des [fonctions fictives de jest](https://jestjs.io/docs/en/mock-functions.html). Ces fonctions fantaisie nous donnent des méthodes pour affirmer si les actions ont été appelées ou non.

Nous pouvons alors affirmer dans nos tests que le talon d'action a été appelé au moment prévu.

La façon dont nous définissons le magasin peut vous sembler un peu étrange.

Nous utilisons `beforeEach` pour nous assurer que nous avons un magasin propre avant chaque test. Le `beforeEach` est un crochet de moka qui est appelé avant chaque test. Dans notre test, nous réaffectons la valeur des variables du magasin. Si nous ne faisions pas cela, les fonctions fictives devraient être automatiquement réinitialisées. Cela nous permet également de changer l'état dans nos tests, sans que cela n'affecte les tests ultérieurs.

La chose la plus importante à noter dans ce test est que **nous créons un magasin Vuex fictif et le passons ensuite à Vue Test Utils**.

Super, donc maintenant nous pouvons simuler des actions, regardons les getters simulés.

### Simuler les Getters

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

C'est un élément assez simple. Il rend le résultat des `clicks` et `inputValue`. Encore une fois, nous ne nous soucions pas vraiment de ce que ces getters renvoient, mais simplement du fait que leur résultat est rendu correctement.

Voyons le test :

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

Ce test est similaire à notre test d'actions. Nous créons un magasin fictif avant chaque test, nous le passons en option lorsque nous appelons `shallowMount`, et nous affirmons que la valeur retournée par nos getters fictifs est rendue.

C'est très bien, mais que faire si nous voulons vérifier que nos getters renvoient la partie correcte de notre état ?

### Simuler avec des modules

Les [Modules](https://vuex.vuejs.org/guide/modules.html) sont utiles pour séparer notre magasin en morceaux gérables. Ils exportent également des getters. Nous pouvons les utiliser dans nos tests.

Examinons notre composant :

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

Le simple composant qui comprend une action et un getter.

Et le test :

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
          getters: myModule.getters
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

### Tester un store de Vuex

Il existe deux approches pour tester un store de Vuex. La première approche consiste à tester séparément les getters, les mutations, et les actions. La seconde est de créer un store et à le tester par rapport à celui-ci. Nous allons examiner les deux approches.

Pour voir comment tester le store de Vuex, nous allons créer simplement un `counter` dans le store. Le store aura une mutation `increment` et un getter `evenOrOdd`.

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

### Tester séparément les getters, les mutations et les actions

Les getters, les mutations et les actions sont tous des fonctions JavaScript, donc nous pouvons les tester sans utiliser Vue Test Utils et Vuex.

L'avantage de tester les getters, les mutations et les actions séparément est que tests unitaires sont détaillés. Lorsque ils échouent, vous savez exactement ce qui ne va pas avec votre code. L'inconvénient est que vous devez avoir des fonctions Vuex fictives, comme `commit` et `dispatch`. Cela peut conduire à une situation où vos tests unitaires réussissent, mais que votre code de production échoue car vos simulations sont incorrectes.

Nous allons créer deux fichiers de test, `mutations.spec.js` et `getters.spec.js`:

Tout d'abord, testons les mutations `increment`

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

Maintenant testons le getter `evenOrOdd`. Nous pouvons le tester en créant un `state` fictif, en appelant le getter avec le `state` et en vérifiant qu'il renvoie la valeur correcte.

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

### Tester le store en activité

Une autre approche pour tester le store de Vuex consiste à créer un store en cours d'exécution en utilisant la configuration du store.

L'avantage de créer une instance de magasin en cours d'exécution est que nous n'avons pas à simuler des fonctions de Vuex.

L'inconvénient est que lorsqu'un test échoue, il peut être difficile de trouver où se situe le problème.

Écrivons un test. Lorsque nous créons un store, nous utiliserons `localVue` pour éviter de polluer le constructeur de base de Vue. Le test crée un store en utilisant l'export `store-config.js` :

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

Notez que nous utilisons `cloneDeep` pour cloner la configuration du store avant de créer un store avec lui. C'est parce que Vuex fait muter l'option d'options utilisé pour créer le store. Pour s'assurer que nous avons un store propre dans chaque test nous devons cloner l'objet `storeConfig`.

Cependant, `cloneDeep` n'est pas assez "profond" pour clone également des modules dans le store. Si notre `storeConfig` inclut des modules, nous devez passer par un objet à `new Vuex.Store()`, comme cela :

```js
import myModule from './myModule'
// ...
const store = new Vuex.Store({ modules: { myModule: cloneDeep(myModule) } })
```

### Resources

- [Exemple de projet pour tester les composants](https://github.com/eddyerburgh/vue-test-utils-vuex-example)
- [Exemple de projet pour tester le store](https://github.com/eddyerburgh/testing-vuex-store-example)
- [`localVue`](../api/options.md#localvue)
- [`createLocalVue`](../api/createLocalVue.md)
