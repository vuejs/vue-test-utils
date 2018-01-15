# Tester des composants monofichiers avec Mocha + webpack

> Un exemple de projet pour cette installation est disponible sur [GitHub](https://github.com/vuejs/vue-test-utils-mocha-webpack-example).

Une des stratégies pour tester des composants monofichiers est de compiler tous nos tests via webpack puis de les passer dans un lanceur de tests. L'avantage de cette approche est qu'elle procure un support complet pour les fonctionnalités de webpack et de `vue-loader`, et ce, afin de ne pas réaliser de compromis dans notre code.

Techniquement, vous pouvez utiliser n'importe quel lanceur de tests et relier le tout manuellement. Cependant, nous avons trouvé [`mocha-webpack`](https://github.com/zinserjan/mocha-webpack) qui procure une expérience très simplifiée pour cette tâche particulière.

## Mettre en place `mocha-webpack`

On va supposer que vous commencez avec une installation qui a déjà webpack, vue-loader et Babel correctement configurés (cf. le template `webpack-simple` via `vue-cli`).

La première chose à faire est d'installer les dépendances de tests :

``` bash
npm install --save-dev @vue/test-utils mocha mocha-webpack
```

Ensuite, on doit définir un script test dans notre `package.json`.

```json
// package.json
{
  "scripts": {
    "test": "mocha-webpack --webpack-config webpack.config.js --require test/setup.js test/**/*.spec.js"
  }
}
```

Quelques éléments importants à noter :

- Le paramètre `--webpack-config` indique le fichier de configuration webpack à utiliser pour les tests. Dans la plupart des cas, c'est identique à la configuration du projet actuel avec une petite modification. On en reparlera plus tard.

- Le paramètre `--require` permet de s'assurer que le fichier `test/setup.js` est bien exécuté avant les tests. Dans celui-ci, on met en place l'environnement où nos tests vont être exécutés.

- Le dernier paramètre est un glob pour indiquer les fichiers de tests à inclure dans le paquetage.

### Configuration supplémentaire pour webpack

#### Externaliser les dépendances npm

Dans nos tests, nous allons surement importer un nombre conséquent de dépendances npm, certaines d'entre elles n'ont pas été conçues pour une utilisation dans un navigateur et ne peuvent être empaquetées par webpack. Il faut aussi considérer qu'externaliser les dépendances augmente énormément la vitesse de lancement des tests. On peut externaliser toutes les dépendances npm avec `webpack-node-externals` :

```js
// webpack.config.js
const nodeExternals = require('webpack-node-externals')

module.exports = {
  // ...
  externals: [nodeExternals()]
}
```

#### Coordinateur de sources

La coordinateur de sources (« Source maps ») doit être indiquée pour être utilisé par `mocha-webpack`. La configuration recommandée est la suivante :

``` js
module.exports = {
  // ...
  devtool: 'inline-cheap-module-source-map'
}
```

Si vous déboguez via votre IDE, il est recommandé d'ajouter la configuration suivante :

``` js
module.exports = {
  // ...
  output: {
    // ...
    // utiliser des chemins absolus (c'est important si vous déboguez avec un IDE)
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  }
}
```

### Mettre en place l'environnement du navigateur

`vue-test-utils` requiert en environnement de navigateur pour fonctionner. On peut le simuler avec Node.js en utilisant `jsdom-global` :

```bash
npm install --save-dev jsdom jsdom-global
```

Puis dans `test/setup.js`:

``` js
require('jsdom-global')()
```

Cela ajoute un environnement de navigateur dans Node.js afin que `vue-test-utils` fonctionne correctement.

### Choisir une bibliothèque d'assertions

[Chai](http://chaijs.com/) est une bibliothèque populaire qui est généralement utilisée avec Mocha. Vous pouvez aussi jeter un coup d'œil à [Sinon](http://sinonjs.org/) pour créer des espions et des fonctions avec un comportement pré-programmé (« stubs »).

Vous pouvez utiliser, alternativement, `expect` qui fait maintenant partie de Jest et expose [la même API](http://facebook.github.io/jest/docs/en/expect.html#content) dans la documentation de Jest.

On va utiliser `expect` et le rendre globalement accessible afin de ne pas avoir à l'importer pour chaque test :

``` bash
npm install --save-dev expect
```

Puis dans `test/setup.js`:

``` js
require('jsdom-global')()

global.expect = require('expect')
```

### Optimiser Babel pour les tests

Notez que nous utilisons `babel-loader` pour gérer JavaScript. Vous devriez déjà avoir Babel de configuré si vous l'utilisez dans votre application via un fichier `.babelrc`. Ici `babel-loader` va automatiquement utiliser le même fichier de configuration.

Une autre chose à noter est que si vous utilisez une version de Node.js 6+, qui supporte déjà une majorité des fonctionnalités d'ES2015, vous pouvez configurer séparément un autre Babel [env option](https://babeljs.io/docs/usage/babelrc/#env-option) qui va uniquement transpiler les fonctionnalités non supportées dans la version de Node.js que vous utilisez (c.-à-d. `stage-2` ou le support de la syntaxe flow, etc.).

### Ajouter un test

Créez dans le dossier `src` un fichier nommé `Counter.vue`:

``` html
<template>
	<div>
	  {{ counter }}
	  <button @click="increment">Incrementer</button>
	</div>
</template>

<script>
export default {
  data () {
    return {
      counter: 0
    }
  },

  methods: {
    increment () {
      this.counter++
    }
  }
}
</script>
```

Puis créez un test nommé `test/Counter.spec.js` avec le code suivant :

```js
import { shallow } from '@vue/test-utils'
import Counter from '../src/Counter.vue'

describe('Counter.vue', () => {
  it('incrémente le compteur quand le bouton est cliqué', () => {
    const wrapper = shallow(Counter)
    wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).toMatch('1')
  })
})
```

Et maintenant on peut lancer le test avec :

```
npm run unit
```

Woohoo, nos tests fonctionnent !

### Ressources

- [Projet exemple pour cette installation](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)
- [Mocha](https://mochajs.org/)
- [mocha-webpack](http://zinserjan.github.io/mocha-webpack/)
- [Chai](http://chaijs.com/)
- [Sinon](http://sinonjs.org/)
- [jest/expect](http://facebook.github.io/jest/docs/en/expect.html#content)
