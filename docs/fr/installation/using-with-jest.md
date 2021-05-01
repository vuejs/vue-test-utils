## Utilisation des outils de Vue Test Utils avec Jest (recommandé)

Jest est un outils de test développé par Facebook, visant à fournir une solution de test unitaire sur batterie. Vous pouvez en savoir plus sur Jest en consultant sa [documentation officielle](https://jestjs.io/).

<div class="vueschool"><a href="https://vueschool.io/courses/learn-how-to-test-vuejs-components?friend=vuejs" target="_blank" rel="sponsored noopener" title="Learn how to use Jest and Vue Test Utils to test Single File Components with Vue School">Apprenez comment utiliser Jest pour tester les composants à fichier unique avec Vue School</a></div>

### Installation avec Vue CLI (recommandé)

Si vous utilisez le CLI de Vue pour construire votre projet, vous pouvez utiliser le plugin [cli-plugin-unit-jest](https://cli.vuejs.org/core-plugins/unit-jest.html) pour effectuer des tests Jest.

```bash
$ vue add unit-jest
```

Le plugin récupère toutes les dépendances nécessaires (y compris jest), crée un fichier `jest.config.js` avec des valeurs par défaut raisonnables, et génère une suite de test type.

Après cela, tout ce que vous avez à faire est d'installer Vue Test Utils.

```bash
$ npm install --save-dev @vue/test-utils
```

### Installation Manuelle

Après avoir configuré Jest, la première chose à faire est d'installer Vue Test Utils et [`vue-jest`](https://github.com/vuejs/vue-jest) pour traiter les mono-fichiers.

```bash
$ npm install --save-dev @vue/test-utils vue-jest
```

Ensuite, vous devez dire à Jest de transformer les fichiers `.vue` en utilisant `.vu-jest`. Vous pouvez le faire en ajoutant la configuration suivante dans le `package.json` ou dans un [fichier de configuration de Jest](https://jestjs.io/docs/en/configuration) :

```json
{
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      // dire à Jest de gérer les fichiers `*.vue`
      "vue"
    ],
    "transform": {
      // traiter les fichiers `*.vue` avec `vue-jest`
      ".*\\.(vue)$": "vue-jest"
    }
  }
}
```

#### Utilisation avec Babel

Si vous voulez utiliser `babel` et importer des composants Vue en fichier unique avec l'extension `.vue` dans vos tests, vous devrez installer babel et transformer les fichiers `.js` avec `babel-jest` .

```bash
npm install --save-dev babel-jest @babel/core @babel/preset-env babel-core@^7.0.0-bridge.0
```

Ensuite, vous devez dire à Jest de transformer les fichiers `.js` en utilisant `babel-jest`. Vous pouvez le faire en ajoutant la configuration suivante dans `package.json` ou dans un [fichier de configuration Jest] autonome (https://jestjs.io/docs/en/configuration) :

```json
{
  "jest": {
    "transform": {
      // process `*.js` files with `babel-jest`
      ".*\\.(js)$": "babel-jest"
    }
  }
}
```

Ensuite vous devez créer la configuration de babel en utilisant les fichiers de configuration [babel.config.json](https://babeljs.io/docs/en/configuration#babelconfigjson) ou [.babelrc.json](https://babeljs.io/docs/en/configuration#babelrcjson) :

```json
{
  "presets": ["@babel/preset-env"]
}
```

Vous pouvez également ajouter ces options à `package.json` :

```json
{
  "babel": {
    "presets": ["@babel/preset-env"]
  }
}
```

### Gestion des alias de webpack

Si vous utilisez un alias de résolution dans la configuration du webpack, par exemple l'alias `@` vers `/src`, vous devez ajouter une configuration correspondante pour Jest également, en utilisant l'option `moduleNameMapper` :

```json
{
  "jest": {
    // suportent le même@ -> cartographie des alias src dans le code source
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

### Couverture du code

Jest peut être utilisé pour générer des rapports de couverture dans plusieur formats. Voici un exemple simple pour commencer :

Développez votre configuration de `jest` avec l'option [`collectCoverage`](https://jestjs.io/docs/en/configuration#collectcoverage-boolean), puis ajoutez le tableau [`collectCoverageFrom`](https://jestjs.io/docs/en/configuration#collectcoveragefrom-array) pour définir les fichiers pour lesquels les informations de couverture doivent être collectées.

```json
{
  "jest": {
    "collectCoverage": true,
    "collectCoverageFrom": ["**/*.{js,vue}", "!**/node_modules/**"]
  }
}
```

Cela permettera d'établir des rapports de couverture avec les [declarants de couverture par défaut](https://jestjs.io/docs/en/configuration#coveragereporters-array-string). Vous trouverez une documentation supplémentaire dans la [documentation de configuration de Jest](https://jestjs.io/docs/en/configuration#collectcoverage-boolean), où vous trouverez des options pour les seuils de couverture, les répertoires de sortie ciles, etc.
