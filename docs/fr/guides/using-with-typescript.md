## Utilisation avec TypeScript

> Un exemple de projet pour cette installation est disponible sur [GitHub](https://github.com/vuejs/vue-test-utils-typescript-example).

TypeScript est un superset populaire de JavaScript qui ajoute des types et des classes au dessus du JS normal. Vue Test Utils inclut les types dans le package distribué, il fonctionne donc bien avec TypeScript.

Dans ce guide, nous expliquerons comment configurer un dispositif de test pour un projet TypeScript en utilisant Jest et Vue Test Utils à partir d'une configuration de base de Vue CLI TypeScript.

### Ajout de TypeScript

Vous devez d'abord créer un projet. SI vous n'avez pas installé Vue CLI, installez-le globalement :

```shell
$ npm install -g @vue/cli
```

Et créer un projet avec :

```shell
$ vue create hello-world
```

Dans l’invite du CLI, choisissez l'option `Manually select features`, sélectionnez TypeScript et appuyez sur la touche enter. Cela créera un projet avec TypeScript déjà configuré.

::: tip NOTE
Si vous souhaitez obtenir un guide plus détaillé sur la configuration de Vue avec TypeScript, consultez le [guide de démarrage de Vue avec TypeScript](https://github.com/Microsoft/TypeScript-Vue-Starter).
:::

L'étape suivante consiste à ajouter Jest au projet.

### Mise en place de Jest

Jest est un outil de test développer par Facebook, visant à fournir une solution de test unitaire sur batterie. Vous pouvez en savoir plus sur Jest en consultant sa [documentation officielle](https://jestjs.io/).

Installez Jest et Vue Test Utils :

```bash
$ npm install --save-dev jest @vue/test-utils
```

Définissez ensuite un script `test:unit` dans le fichier `package.json`.

```json
// package.json
{
  // ..
  "scripts": {
    // ..
    "test:unit": "jest"
  }
  // ..
}
```

### Traitement des composants monofichiers dans Jest

Pour apprend à Jest comment traiter les fichiers `*.vue`, nous devons installer et configurer le préprocesseur `vue-jest` :

```bash
npm install --save-dev vue-jest
```

Ensuite, créez un bloc `jest` dans `package.json` :

```json
{
  // ...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "ts",
      "json",
      // dites à Jest de gérer les fichiers `*.vue`
      "vue"
    ],
    "transform": {
      // traiter les fichiers `*.vue` avec `vue-jest`
      ".*\\.(vue)$": "vue-jest"
    },
    "testURL": "http://localhost/"
  }
}
```

### Configuration de TypeScript pour Jest

Afin d'utiliser les fichiers TypeScript dans les tests, nous devons configurer Jest pour qu'il compile le TypeScript. Pour cela, nous devons installer `ts-jest` :

```bash
$ npm install --save-dev ts-jest
```

Ensuite, nous devons dire à Jest de traiter les fichiers de test TypeScript avec `ts-jest` en ajoutant une entrée sous `jest.transform` dans `package.json` :

```json
{
  // ...
  "jest": {
    // ...
    "transform": {
      // ...
      // traiter les fichiers `*.ts` avec `ts-jest`
      "^.+\\.tsx?$": "ts-jest"
    }
    // ...
  }
}
```

### Placement des dossiers de test

Par défaut, Jest récupère récursivement tous les fichiers qui ont une extension `.spec.js`ou `.test.js` dans l'ensemble du projet.

Pour exécuter des fichiers de test avec une extension `.ts`, nous devons modifier le `testRegex` dans la section de configuration du fichier `package.json`.

Ajoutez ce qui suit dans le champ `jest` du fichier `package.json` :

```json
{
  // ...
  "jest": {
    // ...
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$"
  }
}
```

Jest recommande de créer un répertoire `__tests__` juste à côté du code testé, mais n'hésitez pas à structurer vos tests comme bon vous semble. Attention, Jest crée un répertoire `__snapshots__` à côté des fichiers de test qui effectuent les tests de snapshot.

### Faire un test unitaire

Maintenant que le projet est mis en place, il est temps d'écrire un test unitaire.

Créez un fichier `src/components/__tests__/HelloWorld.spec.ts`, et ajoutez le code suivant :

```js
// src/components/__tests__/HelloWorld.spec.ts
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld.vue', () => {
  test('renders props.msg when passed', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
```

C'est tout ce qui faut faire pour que TypeScript et Vue Test Utils travaillent ensemble !

### Resources

- [Exemple de projet pour cette configuration](https://github.com/vuejs/vue-test-utils-typescript-example)
- [Jest](https://jestjs.io/)
