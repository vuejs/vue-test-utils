## Pour commencer

<div class="vueschool"><a href="https://vueschool.io/lessons/installing-vue-test-utils?friend=vuejs" target="_blank" rel="sponsored noopener" title="Learn how to get started with Vue Test Utils, Jest, and testing Vue Components with Vue School">Apprenez comment démarrer avec Vue Test Utils, Jest, et tester les composants de Vue</a></div>

### Qu'est-ce que Vue Test Utils ?

Vue Test Utils (VTU) est un ensemble de fonctions unitaires visant à simplifier le test des composants de Vue.js. Il fournit des méthodes **monter** et **interagir** avec les composants Vue de manière isolée.

Voyons un exemple :

```js
// Importation de la méthode `mount()` de Vue Test Utils
import { mount } from '@vue/test-utils'

// Le composant à tester
const MessageComponent = {
  template: '<p>{{ msg }}</p>',
  props: ['msg']
}

test('displays message', () => {
  // mount() renvoie un composant Vue enveloppé avec lequel nous pouvons interagir
  const wrapper = mount(MessageComponent, {
    propsData: {
      msg: 'Hello world'
    }
  })

  // Faire valoir le texte rendu du composant
  expect(wrapper.text()).toContain('Hello world')
})
```

Les composants montés sont renvoyés dans un [Wrapper](../api/wrapper/), qui expose les méthodes d'interrogation et d'interaction avec le composant testé.

### Simuler l'interaction avec l'utilisateur

Imaginons un composant de compteur qui s'incrémente lorsque l'utilisateur clique sur le bouton :

```js
const Counter = {
  template: `
    <div>
      <button @click="count++">Add up</button>
      <p>Total clicks: {{ count }}</p>
    </div>
  `,
  data() {
    return { count: 0 }
  }
}
```

Pour simuler le comportement, nous devons d'abord localiser le bouton avec `wrapper.find()`, qui renvoie un **wrapper pour l'élément de bouton**. Nous pouvons ensuite simuler le clic en appelant `.trigger()` sur le wrapper bouton :

```js
test('increments counter value on click', async () => {
  const wrapper = mount(Counter)
  const button = wrapper.find('button')
  const text = wrapper.find('p')

  expect(text.text()).toContain('Total clicks: 0')

  await button.trigger('click')

  expect(text.text()).toContain('Total clicks: 1')
})
```

Remarquez que le test doit être `async` et qu'il faut attendre le `trigger`. Consultez le guide [Tester le comportement asynchrone](./README.md#testing-asynchronous-behavior) pour comprendre pourquoi cela est nécessaire et d'autres éléments à prendre en compte lors du test de scénarios asynchrones.

### Prochaines étapes

Consultez nos [conseils communs pour les tests](./README.md#knowing-what-to-test).

Vous pouvez également explorer [l'API complète](../api/).
