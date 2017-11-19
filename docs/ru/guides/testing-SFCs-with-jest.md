# Тестирование однофайловых компонентов с Jest

> Пример проекта для этой конфигурации доступен на [GitHub](https://github.com/vuejs/vue-test-utils-jest-example).

Jest — это программа для запуска тестов, разработанная Facebook, направленная на предоставление функционального решения для модульного тестирования. Вы можете узнать больше о Jest в [официальной документации](https://facebook.github.io/jest/).

## Установка Jest

Предположим, что вы начинаете с конфигурации, где правильно настроены webpack, vue-loader и Babel — например, развёрнутый шаблон `webpack-simple` с помощью `vue-cli`.

Первым делом нам необходимо установить Jest и `vue-test-utils`:

```bash
$ npm install --save-dev jest vue-test-utils
```

Затем, необходимо указать псевдоним для запуска тестов в нашем `package.json`.

```json
// package.json
{
  "scripts": {
    "test": "jest"
  }
}
```

## Обработка однофайловых компонентов с Jest

Чтобы научить Jest как обрабатывать `*.vue` файлы, нам необходимо установить и настроить пре-процессор `vue-jest`:

``` bash
npm install --save-dev vue-jest
```

Теперь, создадим секцию `jest` в файле `package.json`:

``` json
{
  // ...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      // сообщаем Jest что необходимо обрабатывать *.vue файлы
      "vue"
    ],
    "transform": {
      // обрабатываем *.vue файлы с помощью vue-jest
      ".*\\.(vue)$": "<rootDir>/node_modules/vue-jest"
    },
    "mapCoverage": true
  }
}
```

> **Примечание:** `vue-jest` в настоящее время не поддерживает все возможности `vue-loader`, например пользовательские блоки и загрузку стилей. Кроме того, некоторые функции, специфичные для webpack, такие как code-splitting, также не поддерживаются. Чтобы использовать их прочитайте руководство по [тестированию однофайловых компонентов с Mocha + webpack](./testing-SFCs-with-mocha-webpack.md).

## Обработка псевдонимов webpack

Если вы используете псевдонимы в конфигурации webpack, например когда `@` ссылается на путь `/src`, вам также нужно добавить соответствующую конфигурацию для Jest, используя опцию `moduleNameMapper`:

``` json
{
  // ...
  "jest": {
    // ...
    // добавление поддержки псевдонима @ -> src в исходном коде
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

## Конфигурация Babel для Jest

Хотя последние версии Node уже поддерживают большинство функций ES2015, вы всё равно можете использовать синтаксис ES-модулей и stage-x функции в ваших тестах. Для этого нужно установить `babel-jest`:

``` bash
npm install --save-dev babel-jest
```

Затем мы должны сообщить Jest обрабатывать файлы тестов с JavaScript с помощью `babel-jest`, добавив запись `jest.transform` в `package.json`:

``` json
{
  // ...
  "jest": {
    // ...
    "transform": {
      // ...
      // обрабатывать js с помощью babel-jest
      "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
    },
    // ...
  }
}
```

> By default, `babel-jest` automatically configures itself as long as it's installed. However, because we have explicitly added a transform for `*.vue` files, we now need to explicitly configure `babel-jest` as well.

Assuming using `babel-preset-env` with webpack, the default Babel config disables ES modules transpilation because webpack already knows how to handle ES modules. However, we do need to enable it for our tests because Jest tests run directly in Node.

Also, we can tell `babel-preset-env` to target the Node version we are using. This skips transpiling unnecessary features and makes our tests boot faster.

To apply these options only for tests, put them in a separate config under `env.test` (this will be automatically picked up by `babel-jest`).

Example `.babelrc`:

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

### Snapshot Testing

You can use [`vue-server-renderer`](https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer) to render a component into a string so that it can be saved as a snapshot for [Jest snapshot testing](https://facebook.github.io/jest/docs/en/snapshot-testing.html).

The render result of `vue-server-renderer` includes a few SSR-specific attributes, and it ignores whitespaces, making it harder to scan a diff. We can improve the saved snapshot with a custom serializer:

``` bash
npm install --save-dev jest-serializer-vue
```

Then configure it in `package.json`:

``` json
{
  // ...
  "jest": {
    // ...
    // serializer for snapshots
    "snapshotSerializers": [
      "<rootDir>/node_modules/jest-serializer-vue"
    ]
  }
}
```

### Placing Test Files

By default, Jest will recursively pick up all files that have a `.spec.js` or `.test.js` extension in the entire project. If this does not fit your needs, it's possible [to change the testRegex](https://facebook.github.io/jest/docs/en/configuration.html#testregex-string) in the config section in the `package.json` file.

Jest recommends creating a `__tests__` directory right next to the code being tested, but feel free to structure your tests as you see fit. Just beware that Jest would create a `__snapshots__` directory next to test files that performs snapshot testing.

### Example Spec

If you are familiar with Jasmine, you should feel right at home with Jest's [assertion API](https://facebook.github.io/jest/docs/en/expect.html#content):

```js
import { mount } from 'vue-test-utils'
import Component from './component'

describe('Component', () => {
  test('is a Vue instance', () => {
    const wrapper = mount(Component)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
```

### Ресурсы

- [Пример проекта для этой конфигурации](https://github.com/vuejs/vue-test-utils-jest-example)
- [Примеры и слайды с Vue Conf 2017](https://github.com/codebryo/vue-testing-with-jest-conf17)
- [Jest](https://facebook.github.io/jest/)
- [Babel preset env](https://github.com/babel/babel-preset-env)
