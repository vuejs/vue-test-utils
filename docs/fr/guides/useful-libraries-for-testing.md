## Bibliothèques utiles pour les tests

Vue Test Utils fournit des méthodes pour tester les composants de Vue. Les membres de la communauté ont également écrit quelques bibliothèques supplémentaires qui soit étendent les `vue-test-utils` avec des méthodes supplémentaires utiles, soit fournissent des outils pour tester d'autres choses trouvées dans les applications Vue.

### Bibliothèque de test de Vue

[Vue Testing Library](https://github.com/testing-library/vue-testing-library) est un ensemble d'outils visant à tester les composants sans se fier aux détails de la mise en œuvre. Conçu dans un souci d'accessibilité, son approche permet également de remanier facilement les composants.

Il est construit à partir de Vue Test Utils.

### `vuex-mock-store`

[`vuex-mock-store`](https://github.com/posva/vuex-mock-store) fournit un magasin fictif simple et direct pour simplifier le test des composants consommant un magasin Vuex.

### `jest-matcher-vue-test-utils`

[`jest-matcher-vue-test-utils`](https://github.com/hmsk/jest-matcher-vue-test-utils) ajoute des matchers supplémentaires pour le testeur Jest dans le but de rendre les assertions plus expressives.

### `jest-mock-axios`

[`jest-mock-axios`](https://github.com/knee-cola/jest-mock-axios) vous permet de simuler facilement `axios`, un client HTTP commun, dans vos tests. Il fonctionne d'emblée avec Jest, et l'auteur fournit des conseils sur le support d'autres lanceurs de test dans la documentation.
