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
      // сообщаем Jest что необходимо обрабатывать `*.vue` файлы
      "vue"
    ],
    "transform": {
      // обрабатываем `*.vue` файлы с помощью `vue-jest`
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

<!-- todo ES modules has been supported in latest versions of Node -->
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
      // обрабатывать js с помощью `babel-jest`
      "^.+\\.js$": "<rootDir>/node_modules/babel-jest"
    },
    // ...
  }
}
```

> По умолчанию `babel-jest` автоматически настраивается по установке. Однако, поскольку мы явно добавили преобразование файлов `*.vue`, нам теперь нужно также настроить `babel-jest`.

Предполагая использование `babel-preset-env` с webpack, конфигурация Babel по умолчанию отключает транспиляцию ES-модулей, потому что webpack уже знает как обрабатывать ES-модули. Однако нам нужно включить его для наших тестов, потому что тесты Jest запускаются непосредственно в Node.

Кроме того, мы можем указать `babel-preset-env` в качестве цели используемую нами версию Node. Это пропустит транспиляцию ненужных функций и ускорит загрузку тестов.

Чтобы применить эти параметры только для тестов, поместите их в отдельную конфигурацию в `env.test` (это будет автоматически обработано `babel-jest`).

Пример `.babelrc`:

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

## Тестирование моментальными снимками

Вы можете использовать [`vue-server-renderer`](https://github.com/vuejs/vue/tree/dev/packages/vue-server-renderer) для рендеринга компонента в строку, чтобы его можно было сохранить в качестве снимка для [тестирования моментальными снимками в Jest](https://facebook.github.io/jest/docs/en/snapshot-testing.html).

Результат рендеринга `vue-server-renderer` включает в себя несколько атрибутов, специфичных для SSR, и игнорирует пробелы, что затрудняет сравнивать diff. Мы можем улучшить сохранённый снимок с помощью специального сериализатора:

``` bash
npm install --save-dev jest-serializer-vue
```

Затем добавьте конфигурацию в `package.json`:

``` json
{
  // ...
  "jest": {
    // ...
    // сериализатор для снимков
    "snapshotSerializers": [
      "<rootDir>/node_modules/jest-serializer-vue"
    ]
  }
}
```

## Расположение файлов тестов

По умолчанию Jest будет рекурсивно выбирать все файлы с расширением `.spec.js` или `.test.js` во всём проекте. Если это поведение не соответствует вашим потребностям, то возможно [изменить `testRegex`](https://facebook.github.io/jest/docs/en/configuration.html#testregex-string) в секции конфигурации в файле `package.json`.

Jest рекомендует создать каталог `__tests__` рядом с тестируемым кодом, но не стесняйтесь структурировать ваши тесты по своему усмотрению. Просто остерегайтесь того, что Jest создаст каталог `__snapshots__` рядом с тестовыми файлами, который необходим для тестирования с помощью моментальных снимков.

## Покрытие кода (Coverage)

Jest может быть использован для генерации отчётов о покрытии кода в нескольких форматах. Ниже приведён простой пример для начала:

Расширьте вашу конфигурацию `jest` (обычно расположенную в `package.json` или `jest.config.js`) с помощью опции [collectCoverage](https://facebook.github.io/jest/docs/en/configuration.html#collectcoverage-boolean), и затем добавьте массив [collectCoverageFrom](https://facebook.github.io/jest/docs/en/configuration.html#collectcoveragefrom-array) для определения файлов, для которых требуется собирать информацию о покрытии. Вы также можете установить [mapCoverage](https://facebook.github.io/jest/docs/en/configuration.html#mapcoverage-boolean) в значение `true`, для более аккуратного сбора информации о покрытии.

```json
{
  "jest": {
    // ...
    "collectCoverage": true,
    "collectCoverageFrom": [
      "**/*.{js,vue}",
      "!**/node_modules/**"
    ],
    "mapCoverage": true
  }
}
```

Это включит отчёты о покрытии с использованием [стандартных отчётов о покрытии](https://facebook.github.io/jest/docs/en/configuration.html#coveragereporters-array-string). Вы можете настроить их с помощью опции `coverageReporters`:

```json
{
  "jest": {
    // ...
    "coverageReporters": ["html", "text-summary"]
  }
}
```

Дополнительную информацию можно найти в [документации по конфигурации Jest](https://facebook.github.io/jest/docs/en/configuration.html#collectcoverage-boolean), где вы можете найти параметры для пороговых значений покрытия, каталоги вывода данных и т.д.

## Пример спецификации

Если вы знакомы с Jasmine, то вы должны чувствовать себя как дома с [проверочным API](https://facebook.github.io/jest/docs/en/expect.html#content) Jest:

```js
import { mount } from '@vue/test-utils'
import Component from './component'

describe('Component', () => {
  test('является экземпляром Vue', () => {
    const wrapper = mount(Component)
    expect(wrapper.isVueInstance()).toBeTruthy()
  })
})
```

## Ресурсы

- [Пример проекта для этой конфигурации](https://github.com/vuejs/vue-test-utils-jest-example)
- [Примеры и слайды с Vue Conf 2017](https://github.com/codebryo/vue-testing-with-jest-conf17)
- [Jest](https://facebook.github.io/jest/)
- [Babel preset env](https://github.com/babel/babel-preset-env)
