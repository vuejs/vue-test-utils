## Тестирование однофайловых компонентов с Karma

> Пример проекта для этой конфигурации доступен на [GitHub](https://github.com/eddyerburgh/vue-test-utils-karma-example).

Karma — это программа для запуска тестов, которая открывает браузеры, выполняет тесты и сообщает нам об их результатах. Мы собираемся использовать фреймворк Mocha для написания тестов. Мы будем использовать библиотеку chai для тестовых утверждений.

### Установка Mocha

Предположим, что вы начинаете с конфигурации, где правильно настроены webpack, vue-loader и Babel — например, развёрнутый шаблон `webpack-simple` с помощью `vue-cli`.

Первым делом нам необходимо установить тестовые зависимости:

```bash
npm install --save-dev @vue/test-utils karma karma-chrome-launcher karma-mocha karma-sourcemap-loader karma-spec-reporter karma-webpack mocha
```

Далее нам нужно определить скрипт для запуска тестов в `package.json`.

```json
// package.json
{
  "scripts": {
    "test": "karma start --single-run"
  }
}
```

- Флаг `--single-run` указывает Karma запускать набор тестов только один раз.

### Karma Configuration

Создайте файл `karma.conf.js` в корне вашего проекта:

```js
// karma.conf.js

var webpackConfig = require('./webpack.config.js')

module.exports = function(config) {
  config.set({
    frameworks: ['mocha'],

    files: ['test/**/*.spec.js'],

    preprocessors: {
      '**/*.spec.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    reporters: ['spec'],

    browsers: ['Chrome']
  })
}
```

Этот файл используется для настройки Karma.

Нам нужно предварительно обработать файлы с помощью webpack. Для этого мы добавляем webpack в качестве препроцессора и включаем нашу конфигурацию webpack. Мы можем использовать конфигурационный файл webpack в корне проекте, ничего не меняя.

В нашей конфигурации мы запускаем тесты в Chrome. Для добавления дополнительных браузеров смотрите [раздел Браузеры в документации Karma](http://karma-runner.github.io/3.0/config/browsers.html).

### Выбор библиотеки утверждений

[Chai](http://chaijs.com/) - популярная библиотека утверждений, которая обычно используется вместе с Mocha. Вы посмотреть на [Sinon](http://sinonjs.org/) для создания шпионов и заглушек.

Мы можем установить плагин `karma-chai` для использования `chai` в наших тестах.

```bash
npm install --save-dev karma-chai
```

### Добавление теста

Создайте в каталоге `src` файл с именем `Counter.vue`:

```html
<template>
  <div>
    {{ count }}
    <button @click="increment">Increment</button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        count: 0
      }
    },

    methods: {
      increment() {
        this.count++
      }
    }
  }
</script>
```

И создайте файл `test/Counter.spec.js` со следующим кодом:

```js
import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import Counter from '../src/Counter.vue'

describe('Counter.vue', () => {
  it('increments count when button is clicked', () => {
    const wrapper = shallowMount(Counter)
    wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).contains('1')
  })
})
```

И теперь мы можем запустить тесты:

```
npm run test
```

Ура, наши тесты работают!

### Покрытие кода

Для настройки покрытия кода Karma, мы можем использовать плагин `karma-coverage`.

По умолчанию `karma-coverage` не будет использовать исходные карты для отображения отчётов о покрытии. Поэтому нам нужно использовать `babel-plugin-istanbul`, чтобы убедиться, что покрытие правильно работает.

Установите `karma-coverage`, `babel-plugin-istanbul` и `cross-env`:

```
npm install --save-dev karma-coverage cross-env
```

Мы собираемся использовать `cross-env` для установки переменной окружения `BABEL_ENV`. Таким образом, мы можем использовать `babel-plugin-istanbul` при компиляции наших тестов — мы не хотим включать `babel-plugin-istnabul` при компиляции нашего кода в production:

```
npm install --save-dev babel-plugin-istanbul
```

Обновите файл `.babelrc` для использования `babel-plugin-istanbul`, когда `BABEL_ENV` равняется test:

```json
{
  "presets": [["env", { "modules": false }], "stage-3"],
  "env": {
    "test": {
      "plugins": ["istanbul"]
    }
  }
}
```

Теперь обновите файл `karma.conf.js` для использования покрытия кода. Добавьте `coverage` в массив `reporters` и добавьте поле `coverageReporter`:

```js
// karma.conf.js

module.exports = function(config) {
  config.set({
    // ...

    reporters: ['spec', 'coverage'],

    coverageReporter: {
      dir: './coverage',
      reporters: [{ type: 'lcov', subdir: '.' }, { type: 'text-summary' }]
    }
  })
}
```

И обновите тестовый скрипт `test` для установки `BABEL_ENV`:

```json
// package.json
{
  "scripts": {
    "test": "cross-env BABEL_ENV=test karma start --single-run"
  }
}
```

### Ресурсы

- [Пример проекта для этой конфигурации](https://github.com/eddyerburgh/vue-test-utils-karma-example)
- [Karma](http://karma-runner.github.io/)
- [Mocha](https://mochajs.org/)
- [Chai](http://chaijs.com/)
- [Sinon](http://sinonjs.org/)
