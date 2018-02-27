# Tester des composants monofichiers avec Jest

> Un exemple de projet pour cette installation est disponible sur [GitHub](https://github.com/vuejs/vue-test-utils-jest-example).

Jest est un lanceur de tests développé par Facebook. Il a pour but de procurer une solution complète de tests unitaires. Vous pouvez en apprendre plus sur Jest sur [sa documentation officielle](https://facebook.github.io/jest/).

## Installer Jest

On va supposer que vous commencez avec une installation qui a déjà webpack, vue-loader et Babel correctement configurés (ex. le template `webpack-simple` via `vue-cli`).

La première chose à faire est d'installer Jest et `vue-test-utils` :

```bash
$ npm install --save-dev jest vue-test-utils
```

Ensuite, on doit définir un script dans notre `package.json`.

```json
// package.json
{
  "scripts": {
    "test": "jest"
  }
}
```

## Traiter les composants monofichiers dans Jest

Pour indiquer à Jest comment traiter les fichiers `*.vue`, on va avoir besoin d'installer et de configurer le préprocesseur `vue-jest` : 

``` bash
npm install --save-dev vue-jest
```

Ensuite, créez un objet `jest` dans `package.json` :

``` json
{
  // ...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      // indique à Jest de gérer les fichiers `*.vue`
      "vue"
    ],
    "transform": {
      // traite les fichiers `*.vue` avec `vue-jest`
      ".*\\.(vue)$": "<rootDir>/node_modules/vue-jest"
    },
    "mapCoverage": true
  }
}
```

> **Note :** `vue-jest` ne supporte actuellement pas toutes les fonctionnalités de `vue-loader`, par exemple le support des blocs personnalisés et du chargement de styles. De plus, quelques fonctionnalités spécifiques à webpack comme la scission de code ne sont pas supportées. Pour les utiliser, lisez le guide sur [tester des composants monofichiers avec Mocha et webpack](./testing-SFCs-with-mocha-webpack.md).

## Gérer les alias webpack

Si vous utilisez un alias de résolution dans la configuration de webpack, c.-à-d. faire un alias `@` pour `/src`, vous devez aussi ajouter une configuration pour Jest en utilisant l'option `moduleNameMapper` :

``` json
{
  // ...
  "jest": {
    // ...
    // supporte la même concordonance d'alias @ -> src dans le code source
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

## Configurer Babel pour Jest

<!-- todo ES modules has been supported in latest versions of Node -->
Même si les dernières version de Node.js supportent la plupart des fonctionnalités ES2015, vous souhaitez quand même utiliser la syntaxe des modules ES ainsi que les fonctionnalités `stage-x` dans vos tests. Pour cela, on doit installer `babel-jest` :

``` bash
npm install --save-dev babel-jest
```

Ensuite, on doit indiquer à Jest de gérer les fichiers de tests JavaScript avec `babel-jest` en ajoutant une entrée sous `jest.transform` dans `package.json` :

``` json
{
  // ...
  "jest": {
    // ...
    "transform": {
      // ...
      // gérer le JavaScript avec `babel-jest`
      "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
    },
    // ...
  }
}
```

> Par défaut, `babel-jest` va automatiquement s'autoconfigurer dès l'installation. Cependant, comme nous avons explicitement ajouté une transformation pour les fichiers `*.vue`, on se doit aussi d'explicitement configurer `babel-jest`.

En supposant que vous utilisez `babel-preset-env` avec webpack, la configuration par défaut de Babel désactive la transpilation des modules ES car webpack sait déjà comment traiter ces modules. Nous devons, cependant, l'activer pour nos tests car, Jest fonctionne directement dans Node.js.

On doit aussi indiquer à `babel-preset-env` d'utiliser la version de Node.js que nous utilisons. Cela empêchera de transpiler inutilement des fonctionnalités et lancera nos tests plus rapidement.

Pour appliquer ces options uniquement aux tests, mettez-les dans un fichier de configuration différent sous `env.test` (cela va être automatiquement être utilisé par `babel-jest`).

Exemple `.babelrc`:

``` json
{
  "presets": [
    ["env", { "modules": false }]
  ],
  "env": {
    "test": {
      "presets": [
        ["env", { "targets": { "node": "current" }}]
      ]
    }
  }
}
```

### Test d'instantanés

Vous pouvez utiliser [`vue-server-renderer`](https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer) pour transformer un composant en une chaine de caractères afin de le sauvegarder dans un instantané pour [Jest tests d'instantanés](https://facebook.github.io/jest/docs/en/snapshot-testing.html).

Le résultat du rendu de `vue-server-renderer` inclut quelques attributs spécifiques au rendu côté serveur. Il ignore les espaces, cela rend plus dur d'analyser une différence. On peut améliorer l'instantané sauvegardé avec un sérialiseur personnalisé :

``` bash
npm install --save-dev jest-serializer-vue
```

Puis configurez-le dans `package.json`:

``` json
{
  // ...
  "jest": {
    // ...
    // sérialiseur pour les instantanés
    "snapshotSerializers": [
      "<rootDir>/node_modules/jest-serializer-vue"
    ]
  }
}
```

### Placer les fichiers de tests

Par défaut, Jest va récursivement récupérer tous les fichiers qui ont une extension en `.spec.js` ou `.test.js` dans le projet. Si cela ne correspond pas à vos besoins, il est possible [de changer l'expression régulière `testRegex`](https://facebook.github.io/jest/docs/en/configuration.html#testregex-string) dans la configuration se trouvant dans `package.json`.

Jest recommande de créer un répertoire `__tests__` au même niveau que le code testé, mais soyez libre de structurer vos tests selon vos besoins. Soyez juste au courant que Jest créera un répertoire `__snapshots__` au même niveau que les fichiers de tests qui travaillent sur des instantanés.

### Exemple d'une spécification

Si vous êtes habitué à Jasmine, vous devriez très bien vous en sortir avec [l'API d'assertions de Jest](https://facebook.github.io/jest/docs/en/expect.html#content) :

```js
import { mount } from '@vue/test-utils'
import Component from './component'

describe('Component', () => {
  test('est une instance de Vue', () => {
    const wrapper = mount(Component)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
```

### Ressources

- [Projet exemple pour cette installation](https://github.com/vuejs/vue-test-utils-jest-example)
- [Exemples et diapositives depuis la Vue Conf 2017](https://github.com/codebryo/vue-testing-with-jest-conf17)
- [Jest](https://facebook.github.io/jest/)
- [Babel preset env](https://github.com/babel/babel-preset-env)
