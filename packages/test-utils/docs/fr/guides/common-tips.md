# Astuces

## Savoir quoi tester

Pour les composants graphiques (UI), nous ne recommandons pas une couverture complète. En effet, cela mène à trop d'attention sur les détails de l'implémentation interne des composants et pourrait produire des tests instables.

A contrario, nous recommandons d'écrire des tests qui vérifient le bon fonctionnement de l'interface public de vos composants et ainsi traiter le cœur de ceux-ci telle une boîte noire. Un simple test pourrait vérifier qu'une entrée utilisateur (due à une interaction ou un changement de props) passée au composant nous donnerait le résultat attendu (cela peut être un nouveau rendu ou l'envoi d'un évènement).

Par exemple, pour le composant `Counter`, qui incrémente un compteur visible de 1 à chaque fois qu'un bouton est cliqué, le scénario de test devrait simuler le clic puis s'assurer que le rendu visuel a bien été incrémenté d'un aussi. Le test se fiche de savoir comment le compteur a incrémenté la valeur, il s'occupe seulement de l'entrée et de la sortie (du résultat).

Le bénéfice de cette approche est que tant que l'interface public de votre composant reste la même, vos tests passeront et ce peu importe le comportement interne de votre composant, qui pourrait changer avec le temps.

Ce sujet est discuté plus en détails dans une [très bonne présentation de Matt O'Connell](http://slides.com/mattoconnell/deck#/).

## Rendu superficiel

Dans des tests unitaires, on souhaite s'intéresser au composant qui est en train d'être testé comme une unité isolée et ainsi éviter de s'assurer du bon comportement des composants enfants.

De plus, pour les composants qui contiennent beaucoup de composants enfants, l'intégralité de l'arbre de rendu peut être énorme. Répétitivement rendre tous les composants pourrait réduire la vitesse de nos tests.

`vue-test-utils` vous permets de monter un composant sans avoir à rendre ses composants enfants (en les ignorants) avec la méthode `shallow` :

```js
import { shallow } from '@vue/test-utils'

const wrapper = shallow(Component) // retourne un wrapper contenant une instance de composant montée
wrapper.vm // l'instance de Vue montée
```

## Assertion d'évènements émis

Chaque wrapper monté va automatiquement enregistrer les évènements émis par l'instance de Vue en question. Vous pouvez récupérer ces évènements en utilisant la méthode `wrapper.emitted()` :

``` js
wrapper.vm.$emit('foo')
wrapper.vm.$emit('foo', 123)

/*
`wrapper.emitted()` retourne l'objet suivant :
{
  foo: [[], [123]]
}
*/
```

Vous pouvez ensuite réaliser des assertions sur ces données :
``` js
// asserte que l'évènement est bien émit
expect(wrapper.emitted().foo).toBeTruthy()

// asserte la taille du compteur d'évènement
expect(wrapper.emitted().foo.length).toBe(2)

// asserte le contenu lié à l'évènement
expect(wrapper.emitted().foo[1]).toEqual([123])
```

Vous pouvez aussi récupérer un tableau des évènements dans l'ordre d'émition en appelant [`wrapper.emittedByOrder()`](../api/wrapper/emittedByOrder.md).

## Manipuler l'état d'un composant

Vous pouvez directement manipuler l'état d'un composant en utilisant la méthode `setData` ou `setProps` sur le wrapper :

```js
wrapper.setData({ count: 10 })

wrapper.setProps({ foo: 'bar' })
```

## Simuler des props

Vous pouvez passer des props au composant en utilisant l'option `propsData` de Vue :

```js
import { mount } from '@vue/test-utils'

mount(Component, {
  propsData: {
    aProp: 'une valeur'
  }
})
```

Vous pouvez aussi mettre à jour les props d'un composant déjà monté avec la méthode `wrapper.setProps({})`.

*Pour une liste complète des options, veuillez regarder [la section sur les options de montage](../api/options.md) de la documentation.*

## Appliquer des plugins globaux et des mixins

Des composants pourraient se fier à des fonctionnalités injectées par un plugin global ou un mixin, par exemple `vuex` ou `vue-router`.

Si vous écrivez des tests pour des composants dans une application spécifique, vous pouvez mettre en place les mêmes plugins globaux et mixins en une seule fois dans vos tests. Dans certains cas, comme tester un composant générique utilisé par des applications différentes, il est favorable de tester ces composants dans une installation plus isolée, sans avoir à polluer le constructeur global `Vue`. On peut utiliser la méthode [`createLocalVue`](../api/createLocalVue.md) pour faire cela :

``` js
import { createLocalVue } from '@vue/test-utils'

// créer un constructeur local de `Vue`
const localVue = createLocalVue()

// installer des plugins comme d'habitude
localVue.use(MyPlugin)

// passe la `localVue` aux options de montage
mount(Component, {
  localVue
})
```

## Simuler des injections

Une stratégie alternative pour injecter des propriétés est de simplement les simuler. Vous pouvez faire cela avec l'option `mocks` :

```js
import { mount } from '@vue/test-utils'

const $route = {
  path: '/',
  hash: '',
  params: { id: '123' },
  query: { q: 'bonjour' }
}

mount(Component, {
  mocks: {
    $route // ajoute l'objet `$route` simulé à l'instance de Vue avant de monter le composant
  }
})
```

## Gérer le routage

Depuis que le routage, par définition, porte sur la structure générale de l'application et implique plusieurs composants. Il est mieux testé via des tests d'intégration ou point à point (end-to-end). Pour des composants individuels qui se fie aux fonctionnalités de `vue-router`, vous pouvez les simuler en utilisant les techniques mentionnées plus haut.
