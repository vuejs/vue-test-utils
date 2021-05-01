## Tester le comportement asynchrone

Il existe deux types de comportement asynchrone que vous rencontrerez dans vos tests :

1. Mises à jour appliquées par Vue
2. Comportement asynchrone en dehors de Vue

### Mises à jour appliquées par Vue

Visualiser les lots en attente de mises à jour du DOM et les appliquer de manière asynchrone pour éviter les rendus inutiles causés par de multiples mutations de données.

_Vous pouvez en savoir plus sur les mises à jour asynchrones dans la [Vue docs](https://vuejs.org/v2/guide/reactivity.html#Async-Update-Queue)_

En pratique, cela signifie qu'après la mutation d'une propriété réactive, pour affirmer que le changement a été apporté, votre test doit attendre pendant que Vue effectue les mises à jour.
Un autre moyen est d'utiliser `await Vue.nextTick()`, mais un moyen plus facile et plus propre est de simplement `await`(attendre) la méthode avec laquelle vous avez muté l'état, comme `trigger`

```js
// à l'intérieur de la suite de test, ajouter ce cas test
it('button click should increment the count text', async () => {
  expect(wrapper.text()).toContain('0')
  const button = wrapper.find('button')
  await button.trigger('click')
  expect(wrapper.text()).toContain('1')
})
```

Attendre le déclenchement ci-dessus, c'est la même chose que faire :

```js
it('button click should increment the count text', async () => {
  expect(wrapper.text()).toContain('0')
  const button = wrapper.find('button')
  button.trigger('click')
  await Vue.nextTick()
  expect(wrapper.text()).toContain('1')
})
```

Les méthodes qui peuvent être attendues sont :

- [setData](../api/wrapper/README.md#setdata)
- [setValue](../api/wrapper/README.md#setvalue)
- [setChecked](../api/wrapper/README.md#setchecked)
- [setSelected](../api/wrapper/README.md#setselected)
- [setProps](../api/wrapper/README.md#setprops)
- [trigger](../api/wrapper/README.md#trigger)

### Le comportement asynchrone en dehors de Vue

L'un des comportements asynchrones les plus courants en dehors de Vue est l'appel d'API dans les actions Vuex. Les exemples suivants montrent comment tester une méthode qui effectue un appel d'API. Cet exemple utilise jest pour exécuter le test et pour simuler la bibliothèque HTTP `axios`. Vous trouverez plus d'informations sur les simulations manuelles de jest [ici](https://jestjs.io/docs/en/manual-mocks.html#content).

L'implémentation de la simulations d'`axios` ressemble à ceci :

```js
export default {
  get: () => Promise.resolve({ data: 'value' })
}
```

Le composant ci-dessus effectue un appel API lorsqu'un bouton est cliqué, puis attribue la réponse à `value`.

```html
<template>
  <button @click="fetchResults">{{ value }}</button>
</template>

<script>
  import axios from 'axios'

  export default {
    data() {
      return {
        value: null
      }
    },

    methods: {
      async fetchResults() {
        const response = await axios.get('mock/service')
        this.value = response.data
      }
    }
  }
</script>
```

Un test peut être rédigé de cette manière :

```js
import { shallowMount } from '@vue/test-utils'
import Foo from './Foo'
jest.mock('axios', () => ({
  get: Promise.resolve('value')
}))

it('fetches async when a button is clicked', () => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  expect(wrapper.text()).toBe('value')
})
```

Ce test échoue actuellement parce que l'affirmation est appelée avant que la promesse dans `fetchResults` ne soit résolue. La plupart des bibliothèques de tests unitaires fournissent un rappel pour faire savoir au lanceur quand le test est terminé. Jest et Mocha utilisent tous deux `done`. Nous pouvons utiliser `done` en combinaison avec `$nextTick` ou `setTimeout` pour s'assurer que toutes les promesses sont réglées avant que l'assertion ne soit faite.

```js
it('fetches async when a button is clicked', done => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  wrapper.vm.$nextTick(() => {
    expect(wrapper.text()).toBe('value')
    done()
  })
})
```

La raison pour laquelle `setTimeout` permet au test de passer est que la file d'attente des micro-tâches, où les rappels de promesses sont traités, s'exécute avant la file d'attente des tâches, où les rappels `setTimeout` sont traités. Cela signifie qu'au moment où le rappel `setTimeout` s'exécute, tous les rappels de promesses dans la file d'attente des micro-tâches auront été exécutés. Par contre, `$nextTick` programme une microtâche, mais comme la file d'attente des microtâches est traitée dans l'ordre d'arrivée, cela garantit également que le rappel de promesse a été exécuté au moment où l'assertion est faite. Voir [ici](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) pour une explication plus détaillée.

Une autre solution consiste à utiliser une fonction `async` et un paquet comme [flush-promises](https://www.npmjs.com/package/flush-promises). La fonction `flush-promises` permet de vider tous les gestionnaires de promesses en attente de résolution. Vous pouvez `await` l'appel de `flushPromises` pour vider les promesses en attente et améliorer la lisibilité de votre test

Le test actualisé ressemble à ceci :

```js
import { shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Foo from './Foo'
jest.mock('axios')

it('fetches async when a button is clicked', async () => {
  const wrapper = shallowMount(Foo)
  wrapper.find('button').trigger('click')
  await flushPromises()
  expect(wrapper.text()).toBe('value')
})
```

Cette même technique peut être appliquée aux actionx de Vuex, qui retournent une promesse par défaut.

#### Pourquoi ne pas se contenter de `await button.trigger()` ?

Comme expliqué ci-dessus, il y a une différence entre le temps nécessaire à Vue pour mettre à jour ses composants,
et le temps qu'il faut pour qu'une promesse, comme celle d'`axios` soit tenue.

Une bonne règle à suivre est de toujours `await` les mutations comme `trigger` ou `setProps`.
Si votre code repose sur quelque chose d'asynchrone, comme appeler `axios`, ajoutez également une attente à l'appel `flushPromises`.
