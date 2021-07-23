## Utilisation de Vue Router

### Installation de Vue Router dans les tests

Vous ne devez jamais installer Vue Router sur le constructeur de base de Vue lors de tests. L'installation de Vue Router ajoute `$route` et `$router` comme propriétés en lecture seule sur le prototype Vue.

Pour éviter cela, on peut créer un "localVue", et installer Vue Router dessus.

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter()

shallowMount(Component, {
  localVue,
  router
})
```

> **Note:** L'installation de Vue Router sur une `localVue` ajoute également `$route` et `$router` comme propriétés en lecture seule à une `localVue`. Cela signifie que vous ne pouvez pas utiliser l'option `mocks` pour écraser `$route` et `$router` lors du montage d'un composant utilisant une `localVue` avec Vue Router installé.

### Tester les composants qui utilisent `router-link` ou `router-view`

Lorsque vous installez Vue Router, les composants `router-link` et `router-view` sont enregistrés. Cela signifie que nous pouvons les utiliser n'importe où dans notre application sans avoir besoin de les importer.

Lorsque nous effectuons des tests, nous devons mettre ces composants de Vue Router à la disposition du composant que nous montons. Il existe deux méthodes pour ce faire.

### Utiliser les stubs

```js
import { shallowMount } from '@vue/test-utils'

shallowMount(Component, {
  stubs: ['router-link', 'router-view']
})
```

### Installer Vue Router avec localVue

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)

shallowMount(Component, {
  localVue
})
```

L'instance du routeur est disponible pour tous les composants enfants, ce qui est utile pour les tests d'intégration.

### Simuler `$route` et `$router`

Parfois, vous voulez tester qu'un composant fait quelque chose avec les paramètres des objets `$route` et `$routeur`. Pour ce faire, vous pouvez passer des simulations personnalisées à l'instance Vue.

```js
import { shallowMount } from '@vue/test-utils'

const $route = {
  path: '/some/path'
}

const wrapper = shallowMount(Component, {
  mocks: {
    $route
  }
})

wrapper.vm.$route.path // /some/path
```

### Les gotchas commun

L'installation de Vue Router ajoute `$route` et `$router` comme propriétés en lecture seule sur le prototype de Vue.

Cela signifie que tous les futurs tests qui tenteront de simuler `$route` et `$router` echoueront

Pour éviter cela, n'installez jamais Vue Router globalement lorsque vous effectuez des tests; utilisez un `localVue` comme détaillé ci-dessus.
