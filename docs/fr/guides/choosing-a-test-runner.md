# Choisir un lanceur de tests

Un lanceur de tests est un programme qui lance des tests (et oui !).

Il y a un nombre conséquent de lanceurs de tests JavaScript et `vue-test-utils` fonctionne avec tous. `vue-test-utils` est agnostique en terme de lanceurs de tests.

Il y a tout de même plusieurs choses à considérer afin de choisir un lanceur de tests : variété des fonctionnalités, performance et support de la précompilation des composants monofichiers. Après avoir soigneusement analysé et comparé les bibliothèques, il y a deux lanceurs de tests que nous recommandons :

- [Jest](https://facebook.github.io/jest/docs/en/getting-started.html#content) est le lanceur de test le plus complet en termes de fonctionnalités. Il requiert une configuration minimale, installe JSDOM par défaut, fournit des assertions prêtes à l'utilisation et a une très bonne interface en ligne de commandes. Cependant, vous allez avoir besoin d'un préprocesseur afin d'être capable d'importer les composants monofichiers dans vos tests. On a créé le préprocesseur `vue-jest` qui peut gérer les fonctionnalités communes des composants monofichiers. Il n'a cependant pas encore autant de fonctionnalités que `vue-loader`.

- [mocha-webpack](https://github.com/zinserjan/mocha-webpack) est une surcouche de webpack + Mocha avec une expérience simplifiée et un mode de surveillance. Les bénéfices de cette installation sont que l'on peut avoir le support complet des composants monofichiers via webpack + `vue-loader`. Il y a cependant plus de configurations à réaliser.

## Environnement du navigateur

`vue-test-utils` se fie à un environnement de navigateur. Techniquement, vous pouvez le lancer dans un vrai navigateur, mais cela n'est pas recommandé dû à la complexité de lancer de réels navigateurs sur différentes plateformes. Au lieu de cela, nous recommandons de lancer les tests sous Node.js avec un environnement virtuel de navigateur en utilisant le [JSDOM](https://github.com/tmpvar/jsdom).

Le lanceur de tests Jest installe automatiquement JSDOM. Pour d'autres lanceurs de tests, il faut le faire manuellement en utilisant [jsdom-global](https://github.com/rstacruz/jsdom-global) dans la déclaration de vos tests :

``` bash
npm install --save-dev jsdom jsdom-global
```
---
``` js
// dans test setup / entry
require('jsdom-global')()
```

## Tester des composants monofichiers

Les composants Vue monofichiers nécessitent une étape de précompilation avant qu'ils soient lancés dans Node.js ou sur un navigateur. Il existe deux méthodes recommandées pour réaliser la compilation : avec un préprocesseur Jest ou directement en utilisant webpack.

Le préprocesseur `vue-jest` supporte les fonctionnalités basiques des composants monofichiers. Il ne gère pas actuellement les blocs de style et les blocs personnalisés, qui sont eux uniquement supportés par `vue-loader`. Si vous utilisez ces fonctionnalités ou d'autres configurations liées à webpack, vous aurez besoin d'utiliser l'installation basée sur webpack + `vue-loader`

Lisez les guides suivants pour différentes installations :

- [Tester des composants monofichiers avec Jest](./testing-SFCs-with-jest.md)
- [Tester des composants monofichiers avec Mocha + webpack](./testing-SFCs-with-mocha-webpack.md)

## Ressources

- [Comparaison de lanceurs de tests](https://github.com/eddyerburgh/vue-unit-test-perf-comparison)
- [Projet exemple avec Jest](https://github.com/vuejs/vue-test-utils-jest-example)
- [Projet exemple avec Mocha](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)
- [Projet exemple avec tape](https://github.com/eddyerburgh/vue-test-utils-tape-example)
- [Projet exemple avec AVA](https://github.com/eddyerburgh/vue-test-utils-ava-example)
