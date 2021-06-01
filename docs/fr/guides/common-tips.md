## Les Conseils pratiques

### Savoir ce qu'il faut tester

Pour les composants UI, nous ne recommandons pas de viser une couverture complète par ligne, car cela conduit à trop se concentrer sur les détails de mise en œuvre interne des composants et pourrait entraîner des tests fragiles.

Nous recommandons plutôt de rédiger des tests qui affirment l'interface publique de notre composant et de traiter ses éléments internes comme une boîte noire. Un seul cas de test permettrait d'affirmer qu'une entrée (interaction avec l'utilisateur ou changement de props) fournie au composant se traduit par la sortie attendue (résultat de rendu ou événements personnalisés émis).

Par exemple, imaginez un composant `Counter` qui incrémente un compteur d'affichage de 1 chaque fois qu'un bouton est cliqué. Le test ne devrait pas se soucier de la façon dont le `Counter` incrémente la valeur - il ne s'intéresse qu'à l'entrée et à la sortie.

L'avantage de cette approche est que tant que l'interface publique de votre composant reste la même, vos tests seront réussis, quelle que soit l'évolution de l'implémentation interne du composant dans le temps.

Ce sujet est abordé plus en détail dans une [excellente présentation de Matt O'Connell](https://www.youtube.com/watch?v=OIpfWTThrK8).

### Le montage Shallow

Parfois, le montage d'un composant entier avec toutes ses dépendances peut devenir lent ou lourd. Par exemple, les composants qui contiennent de nombreux composants enfants.

Vue Test Utils vous permet de monter un composant sans rendre ses composants enfants (en les "stubbing") avec la méthode [`shallowMount`](../api/#shallowmount).

```js
import { shallowMount } from '@vue/test-utils'
import Component from '../Component.vue'

const wrapper = shallowMount(Component)
```

Comme pour [mount](../api/#mount), il crée un [Wrapper](../api/wrapper) qui contient le composant Vue monté et rendu, mais avec des composants enfants.

Notez que l'utilisation de `shallowMount` rendra le composant testé différent du composant que vous exécutez dans votre application - certaines de ses parties ne seront pas rendues ! C'est pourquoi ce n'est pas la façon recommandée de tester les composants, sauf si vous rencontrez des problèmes de performance ou si vous avez besoin de simplifier les dispositions de test.

### Les Hooks de cycle de vie

<div class="vueschool" style="margin-top:1em;"><a href="https://vueschool.io/lessons/learn-how-to-test-vuejs-lifecycle-methods?friend=vuejs" target="_blank" rel="sponsored noopener" title="Learn how to use Vue Test Utils to test Vue.js Lifecycle Hooks with Vue School">Apprenez à tester les méthodes et les intervalles du cycle de vie avec Vue School</a></div>

Lorsque vous utilisez les méthodes `mount` ou `shallowMount`, vous pouvez vous attendre à ce que votre composant réponde à tous les événements du cycle de vie. Cependant, il est important de noter que les méthodes `beforeDestroy` et `destroyed` _ne seront pas déclanchées_ à moins que le composant ne soit détruit manuellement en utilisant `Wrapper.destroy()`.

De plus, le composant ne sera pas automatiquement détruit à la fin de chaque spécification, et c'est à l'utilisateur d'arrêter ou de nettoyer manuellement les tâches qui continueront à s'exécuter (`setInterval` ou `setTimeout`, par exemple) avant la fin de chaque spec.

### Écrire des tests asynchrones (nouveau)

Par défaut, Vue regroupe les mises à jour pour les exécuter de manière asynchrone (à la prochaine "coche"). Ceci afin d'éviter les re-rendus DOM inutiles, et les calculs des watchers ([voir les docs](https://vuejs.org/v2/guide/reactivity.html#Async-Update-Queue) pour plus de détails).

Cela signifie que vous **devez** attendre que les mises à jour s'exécutent après avoir modifié une propriété réactive. Vous pouvez le faire en attendant les méthodes de mutations comme le `trigger` :

```js
it('updates text', async () => {
  const wrapper = mount(Component)
  await wrapper.trigger('click')
  expect(wrapper.text()).toContain('updated')
  await wrapper.trigger('click')
  wrapper.text().toContain('some different text')
})

// Ou si vous êtes sans async/await
it('render text', done => {
  const wrapper = mount(TestComponent)
  wrapper.trigger('click').then(() => {
    wrapper.text().toContain('updated')
    wrapper.trigger('click').then(() => {
      wrapper.text().toContain('some different text')
      done()
    })
  })
})
```

Pour en savoir plus, consultez la page [Tester le comportement asynchrone](../guides/README.md#testing-asynchronous-behavior)

### Affirmer les événements émis

Chaque wrapper monté enregistre automatiquement tous les événements émis par l'instance Vue sous-jacente. Vous pouvez récupérer les événements enregistrés en utilisant la méthode `wrapper.emitted()` :

```js
wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
`wrapper.emitted()` renvoie l'objet suivant :
{
  foo: [[], [123]]
}
*/
```

Vous pouvez alors faire des affirmations sur la base de ces données :

```js
// affirmer l'émission de l'événement
expect(wrapper.emitted().foo).toBeTruthy()

// affirmer le nombre d'événements
expect(wrapper.emitted().foo.length).toBe(2)

// affirmer le paramètre additionnel
expect(wrapper.emitted().foo[1]).toEqual([123])
```

Vous pouvez également obtenir un tableau des événements dans leur ordre d'émission en appelant [`wrapper.emittedByOrder()`](../api/wrapper/emittedByOrder.md).

### Événement émis d'un composant Enfant

Vous pouvez émettre un événement personnalisé à partir d'un composant enfant en accédant à l'instance.

**Composant en cours de test**

```html
<template>
  <div>
    <child-component @custom="onCustom" />
    <p v-if="emitted">Emitted!</p>
  </div>
</template>

<script>
  import ChildComponent from './ChildComponent'

  export default {
    name: 'ParentComponent',
    components: { ChildComponent },
    data() {
      return {
        emitted: false
      }
    },
    methods: {
      onCustom() {
        this.emitted = true
      }
    }
  }
</script>
```

**Test**

```js
import { mount } from '@vue/test-utils'
import ParentComponent from '@/components/ParentComponent'
import ChildComponent from '@/components/ChildComponent'

describe('ParentComponent', () => {
  it("displays 'Emitted!' when custom event is emitted", () => {
    const wrapper = mount(ParentComponent)
    wrapper.find(ChildComponent).vm.$emit('custom')
    expect(wrapper.html()).toContain('Emitted!')
  })
})
```

### Manipulation de l'état des composants

Vous pouvez directement manipuler l'état du composant en utilisant la méthode `setData` ou `setProps` dans le wrapper :

```js
wrapper.setData({ count: 10 })

wrapper.setProps({ foo: 'bar' })
```

### Simuler les Props

Vous pouvez passer les props au composant en utilisant l'option intégrée `propsData` de Vue :

```js
import { mount } from '@vue/test-utils'

mount(Component, {
  propsData: {
    aProp: 'some value'
  }
})
```

Vous pouvez également mettre à jour les props d'un composant déjà monté avec la méthode `wrapper.setProps({})`.

\_Pour une liste complète des options, vueillez consulter la [section des options de montage](../api/options.md) de la documentation.

### Simulation de transition

Bien qu'appeler `await Vue.nextTick()` fonctionne bien pour la plupart des cas d'utilisation, il y a certaines situations où des solutions de contournement supplémentaire sont nécessaires. Ces problèmes seront résolus avant que la bibliothèque `vue-test-utils` ne sorte de la version bêta. Un exemple est celui des composants de test unitaire avec le wrapper `<transition>` fourni par Vue.

```vue
<template>
  <div>
    <transition>
      <p v-if="show">Foo</p>
    </transition>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show: true
    }
  }
}
</script>
```

Vous pourriez vouloir écrire un test qui vérifie que Foo est affiché, puis lorsque `show` est réglé sur `false`, Foo n'est plus rendu. Un tel test pourrait être écrit de la manière suivante :

```js
test('should render Foo, then hide it', async () => {
  const wrapper = mount(Foo)
  expect(wrapper.text()).toMatch(/Foo/)

  await wrapper.setData({
    show: false
  })

  expect(wrapper.text()).not.toMatch(/Foo/)
})
```

En pratique, bien que nous appelions et attendions `setData` pour assurer la mise à jour du DOM, ce test échoue. Il s'agit d'un problème permanent lié à la façon dont Vue implémente le composant `<transition>`, que nous aimerions résoudre avant la version 1.0. Pour l'instant, il existe quelques solutions de contournement :

#### Utiliser un helper `transitionStub`

```js
const transitionStub = () => ({
  render: function(h) {
    return this.$options._renderChildren
  }
})

test('should render Foo, then hide it', async () => {
  const wrapper = mount(Foo, {
    stubs: {
      transition: transitionStub()
    }
  })
  expect(wrapper.text()).toMatch(/Foo/)

  await wrapper.setData({
    show: false
  })

  expect(wrapper.text()).not.toMatch(/Foo/)
})
```

Cela remplace le comportement par défaut du composant `<transition>` et affiche les enfants dès que la condition booléenne pertinente change, par opposition à l'application de classes CSS, qui est la façon dont le composant `<transition>` de Vue fonctionne.

#### Éviter `setData`

Une autre solution est tout simplement d'éviter d'utiliser `setData` en écrivant deux tests, la configuration requise étant effectuée à l'aide des options `mount` et `shallowMount` :

```js
test('should render Foo', async () => {
  const wrapper = mount(Foo, {
    data() {
      return {
        show: true
      }
    }
  })

  expect(wrapper.text()).toMatch(/Foo/)
})

test('should not render Foo', async () => {
  const wrapper = mount(Foo, {
    data() {
      return {
        show: false
      }
    }
  })

  expect(wrapper.text()).not.toMatch(/Foo/)
})
```

### Appliquer les plugins et les mixins globaux

Certains des composants peuvent reposer sur des fonctionnalités injectées par un plugin ou par un mixin global, par exemple `vuex` et `vue-router`.

Si vous écrivez des tests pour des composants dans une application spécifique, vous pouvez configurer les mêmes plugins et mixins globaux une fois dans l'entrée de vos tests. Mais dans certains cas, par exemple pour tester une suite de composants génériques qui peuvent être partagés entre différentes applications, il est préférable de tester vos composants dans une configuration plus isolée, sans polluer le constructeur global "Vue". Nous pouvons utiliser la méthode [`createLocalVue`](../api/createLocalVue.md) pour y parvenir :

```js
import { createLocalVue, mount } from '@vue/test-utils'

// créer un constructeur de `Vue` étendu
const localVue = createLocalVue()

// installer les plugins comme d'habitude
localVue.use(MyPlugin)

// passer la `localVue` aux options de montage
mount(Component, {
  localVue
})
```

**À noter: certains plugins, comme Vue Router, ajoutent des propriétés en lecture seule au constructeur global de Vue. Cala rend impossible de réinstaller le plugin sur un constructeur `localVue`, ou d'ajouter des mocks pour ces propriétés en lecture seule**

### Injection Simulée

Une autre stratégie pour les props injectés consiste simplement à les simuler. Vous pouvez le faire avec l'option `mocks` :

```js
import { mount } from '@vue/test-utils'

const $route = {
  path: '/',
  hash: '',
  params: { id: '123' },
  query: { q: 'hello' }
}

mount(Component, {
  mocks: {
    // ajouter l'objet `$route` simlué à l'instance Vue
    // avant le montage du composant
    $route
  }
})
```

### Les composants d'écrasement

Vous pouvez remplacer les composants qui sont enregistrés globalement ou localement en utilisant l'option `stubs` :

```js
import { mount } from '@vue/test-utils'

mount(Component, {
  // Résoudra le problème des composants enregistrés au niveau mondial avec
  // le stub vide
  stubs: ['globally-registered-component']
})
```

### Gestion du routage

Étant donné que le routage, par définition, a trait à la structure globale de l'application et implique de multiples composants, il est préférable de le tester par des tests d'intégration ou de bout en bout. Pour les composants individuels qui s'appuient sur les fonctionnalités de `vue-router`, vous pouvez les simuler en utilisant les techniques mentionnées ci-dessus.

### Détecter les styles

Votre test ne peut détecter que les styles en ligne lorsqu'il est exécuté dans `jsdom`.
