## Utilisation d'autres testeurs

### Fonctionnement de Vue Test Utils avec Karma

[Karma](http://karma-runner.github.io/) est un programme de test qui lance des navigateurs, effectue des tests et nous les rapporte.

En plus de Karma, vous pouvez utiliser le cadre [Mocha](https://mochajs.org/) pour écrire les tests, et la bibliothèque [Chai](http://chaijs.com/) pour les assertions des tests. Vous pouvez également consulter [Sinon](http://sinonjs.org/) pour créer des spies et des stubs

Vous trouverez ci-dessous une configuration de base de Karma pour Vue Test Utils :

```js
// karma.conf.js
var webpackConfig = require('./webpack.config.js')

module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],
    files: ['test/**/*.spec.js'],
    webpack: webpackConfig,
    reporters: ['spec'],
    browsers: ['Chrome'],
    preprocessors: {
      '**/*.spec.js': ['webpack', 'sourcemap']
    }
  })
}
```

### Fonctionnement de Vue Test Utils avec mocha-webpack

Une autre stratégie pour tests les SFC consiste à compiler tous nos tests via webpack et à les exécuter ensuite dans un testeur. L'avantage de cette approche est qu'elle nous donne un support complet pour toutes les fonctionnalités de webpack et du `vue-loader`, donc nous n'avons pas à faire de compromis dans notre code source.

Nous avons trouvé [`mochapack`](https://github.com/sysgears/mochapack) qui nous offre une expérience très simplifiée pour cette tâche particulière.

La première chose à faire est d'installer des dépendances de test :

```bash
npm install --save-dev @vue/test-utils mocha mochapack
```

Après avoir installer Vue Test Utils et `mochapack`, vous devez définir un script de test dans votre `package.json` :

```json
// package.json
{
  "scripts": {
    "test": "mochapack --webpack-config webpack.config.js --require test/setup.js test/**/*.spec.js"
  }
}
```

### Fonctionnement de Vue Test Utils sans étape de construction

Alors qu'il est courant de construire des applications Vue en utilisant des outils tels que [webpack](https://webpack.js.org/) pour regrouper l'application, `vue-loader` pour exploiter les composants de fichiers uniques, il est possible d'uiliser beaucoup moins les Vue Test Utils . Les exigences minimales pour les Vue Test Utils, en dehors de la bibliothèque elle-même, sont les suivantes :

- Vue
- [vue-template-compiler](https://github.com/vuejs/vue/tree/dev/packages/vue-template-compiler#readme)
- a DOM (be it [jsdom](https://github.com/jsdom/jsdom) in a Node environment, or the DOM in a real browser)

Notez que `jsdom` (ou toute autre implémentation de DOM) doit être requis avant les Vue Test Utils, car il s'attend à ce qu'un DOM (vrai DOM, ou JSDOM) existe.
