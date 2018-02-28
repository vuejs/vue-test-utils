# Pour commencer

## Installation

Pour avoir un rapide avant-gout de `vue-test-utils`, clonez notre répertoire de démonstration avec l'installation de base puis installez les dépendances :

``` bash
git clone https://github.com/vuejs/vue-test-utils-getting-started
cd vue-test-utils-getting-started
npm install
```

Vous allez voir que le projet possède un simple composant, `counter.js` :

```js
// counter.js

export default {
  template: `
    <div>
      <span class="count">{{ count }}</span>
      <button @click="increment">Increment</button>
    </div>
  `,

  data () {
    return {
      count: 0
    }
  },

  methods: {
    increment () {
      this.count++
    }
  }
}
```

### Montages de composants

`vue-test-utils` teste les composants Vue en les isolants puis en les montant, il simule les entrées nécessaires (props, injections et évènements utilisateur) et asserte les sorties (le rendu, les évènements émis).

Les composants montés sont retournés dans un [Wrapper](./api/wrapper.md), qui expose de nombreuses méthodes pour manipuler, traverser et interroger l'instance du composant Vue en question.

Vous pouvez créer des wrappers en utilisant la méthode `mount`. Créons un fichier nommé `test.js` :

```js
// test.js

// Importe la méthode `mount()` depuis test utils
// et le composant qu'on souhaite tester
import { mount } from '@vue/test-utils'
import Counter from './counter'

// On monte le composant et nous voilà avec un wrapper
const wrapper = mount(Counter)

// On accède à l'instance actuelle de Vue via `wrapper.vm`
const vm = wrapper.vm

// Pour inspecter le wrapper en profondeur, utilisez console
// puis votre aventure avec vue-test-utils commence !
console.log(wrapper)
```

### Tester le contenu du rendu HTML d'un composant

Nous avons maintenant un wrapper, la première chose que l'on peut faire, c'est de vérifier que le contenu du rendu HTML du composant correspond à celui attendu.

```js
import { mount } from '@vue/test-utils'
import Counter from './counter'

describe('Counter', () => {
  // On monte le composant et nous voilà avec un wrapper
  const wrapper = mount(Counter)

  it('fait le rendu correctement', () => {
    expect(wrapper.html()).toContain('<span class="count">0</span>')
  })

  // c'est aussi très simple de vérifier qu'un élément existe
  it('a un bouton', () => {
    expect(wrapper.contains('button')).toBe(true)
  })
})
```

On peut maintenant lancer les tests avec  `npm test`. Vous devriez voir les tests se lancer et réussir.

### Simulation de l'interaction utilisateur

Notre compteur devrait s'incrémenter quand l'utilisateur clique sur le bouton. Pour simuler ce comportement, on doit tout d'abord localiser le bouton avec `wrapper.find()`, qui retourne un **wrapper pour l'élément bouton**. On peut ensuite simuler un clic en appelant `.trigger()` sur le wrapper du bouton :

```js
it('le clic sur le bouton devrait incrémenter le compteur', () => {
  expect(wrapper.vm.count).toBe(0)
  const button = wrapper.find('button')
  button.trigger('click')
  expect(wrapper.vm.count).toBe(1)
})
```

### Et quid de `nextTick` ?

Vue groupe les mises à jour du DOM en attentes puis les appliquent de façon asynchrone pour prévenir d'éventuels multiples rendus causés par de multiples mutations de données. C'est pourquoi en pratique, on a souvent à utiliser `Vue.nextTick` pour attendre que Vue modifie le DOM actuel après avoir lancé quelques changements d'état.

Pour simplifier cela, `vue-test-utils` applique toutes les mises à jour de façon synchrone afin que vous n'ayez pas besoin d'utiliser `Vue.nextTick` pour attendre des mises à jour du DOM dans vos tests.

*Note : `nextTick` est toujours nécessaire quand vous souhaitez explicitement faire avancer la boucle des évènements, pour des opérations telles que des fonctions de rappel ou des résolutions de promesses.*

Si vous avez toujours besoin de `nextTick` dans vos fichiers de tests, faites attention aux erreurs jetées aux erreurs lancées à l'intérieur qui peuvent ne pas être attrapées par votre lanceur de tests car il utilise des promesses. Il y a deux approches pour régler celà : vous pouvez affecter la fonction de rappel `done` du système de gestion d'erreurs globales de Vue au démarrage des tests, ou vous pouvez appeler `nextTick` sans argument pour l'utiliser sous forme de promesse :

```js
// ceci ne sera pas intercepté
it("pas d'interception", (done) => {
  Vue.nextTick(() => {
    expect(true).toBe(false)
    done()
  })
})

// les deux tests ci-dessous vont fonctionner comme souhaité
it("attraper l'erreur avec `done`", (done) => {
  Vue.config.errorHandler = done
  Vue.nextTick(() => {
    expect(true).toBe(false)
    done()
  })
})

it("attraper l'erreur avec une promesse", () => {
  return Vue.nextTick()
    .then(function () {
      expect(true).toBe(false)
    })
})
```

## Et après ?

- Intégrez `vue-test-utils` dans votre projet en [choisissant votre lanceur de tests](./choosing-a-test-runner.md)
- En apprendre plus sur les [techniques et astuces pour écrire des tests](./common-tips.md)
