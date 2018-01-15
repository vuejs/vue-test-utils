# Тестирование однофайловых компонентов с Mocha + webpack

> Пример проекта для этой конфигурации доступен на [GitHub](https://github.com/vuejs/vue-test-utils-mocha-webpack-example).

Другая стратегия тестирования однофайловых компонентов заключается в компиляции всех наших тестов с помощью webpack, а затем программой для запуска тестов. Преимущество такого подхода заключается в том, что он даёт нам полную поддержку всех функций webpack и `vue-loader`, поэтому нам не нужно идти на компромиссы в нашем исходном коде.

Технически, вы можете использовать любую программу для запуска тестов, которая вам нравится, и вручную соединять вещи, но мы нашли [`mocha-webpack`](https://github.com/zinserjan/mocha-webpack) как очень удобный способ для реализации этой задачи.

## Настройка `mocha-webpack`

Мы предположим, что вы начинаете с настройки, когда уже есть правильно настроенные webpack, vue-loader и Babel — например используя шаблон `webpack-simple`, развёрнутый с помощью `vue-cli`.

Первое, что нужно сделать, это установить тестовые зависимости:

``` bash
npm install --save-dev @vue/test-utils mocha mocha-webpack
```

Затем мы должны указать скрипт test в нашем `package.json`.

```json
// package.json
{
  "scripts": {
    "test": "mocha-webpack --webpack-config webpack.config.js --require test/setup.js test/**/*.spec.js"
  }
}
```

Несколько вещей, о том что мы сделали:

- Флаг `--webpack-config` указывает конфигурационный файл webpack для использования в тестах. В большинстве случаев это будут идентичная конфигурация, используемой в проекте, с одной небольшой доработкой. Мы поговорим об этом позднее.

- Флаг `--require` гарантирует, что файл `test/setup.js` будет запущен перед любыми тестами, в котором мы можем настроить для наших тестов глобальное окружение, в котором они будут запускаться.

- Последний аргумент — это шаблон для тестовых файлов, которые будут включены в тестовую сборку.

### Дополнительная конфигурация webpack

#### Вынесение внешних NPM-зависимостей

В наших тестах мы, скорее всего, импортируем ряд NPM-зависимостей — некоторые из этих модулей могут быть написаны не для использования в браузере и просто не смогут быть корректно добавлены в сборку webpack. Другой плюс в том, что извлечение внешних зависимостей значительно улучшит скорость загрузки тестов. Мы можем вынести все NPM-зависимости с помощью `webpack-node-externals`:

```js
// webpack.config.js
const nodeExternals = require('webpack-node-externals')

module.exports = {
  // ...
  externals: [nodeExternals()]
}
```

#### Source Maps

Source maps должны быть встроены для использования в `mocha-webpack`. Рекомендуемая конфигурация:

``` js
module.exports = {
  // ...
  devtool: 'inline-cheap-module-source-map'
}
```

При отладке через IDE рекомендуется также добавить следующее:

``` js
module.exports = {
  // ...
  output: {
    // ...
    // использовать абсолютные пути в sourcemaps (важно для отладки через IDE)
    devtoolModuleFilenameTemplate: '[absolute-resource-path]',
    devtoolFallbackModuleFilenameTemplate: '[absolute-resource-path]?[hash]'
  }
}
```

### Настройка браузерного окружения

`vue-test-utils` требует браузерного окружения для запуска. Мы можем симулировать его в Node используя `jsdom-global`:

```bash
npm install --save-dev jsdom jsdom-global
```

Затем в `test/setup.js`:

``` js
require('jsdom-global')()
```

Это добавит браузерное окружение в Node, таким образом `vue-test-utils` сможет корректно запуститься.

### Выбор библиотеки утверждений

[Chai](http://chaijs.com/) — популярная библиотека утверждений, которая обычно используется вместе с Mocha. Вы также можете воспользоваться [Sinon](http://sinonjs.org/) для создания шпионов и заглушек.

В качестве альтернативы вы можете использовать `expect`, который является частью Jest и реализует [точно такой же API](http://facebook.github.io/jest/docs/en/expect.html#content) в документации Jest.

Мы будем использовать `expect` здесь и сделаем его глобально доступным, чтобы нам не приходилось импортировать его в каждом тесте:

``` bash
npm install --save-dev expect
```

Затем в `test/setup.js`:

``` js
require('jsdom-global')()

global.expect = require('expect')
```

### Оптимизация Babel для тестов

Обратите внимание, что мы используем `babel-loader` для обработки JavaScript. У вас уже должен быть настроен Babel, если вы используете его в своём приложении, через файл `.babelrc`. Здесь `babel-loader` будет автоматически использовать тот же файл конфигурации.

Следует отметить, что если вы используете Node 6+, которая уже поддерживает большинство функций ES2015, вы можете настроить отдельную [опцию env](https://babeljs.io/docs/usage/babelrc/#env-option) Babel, которая будет транспилировать только те функции, которые ещё не поддерживаются в используемой версии Node (например, `stage-2` или поддержку синтаксиса flow, и т.п.).

### Добавление теста

Создайте файл в `src` названный `Counter.vue`:

``` html
<template>
	<div>
	  {{ count }}
	  <button @click="increment">Увеличить</button>
	</div>
</template>

<script>
export default {
  data () {
    return {
      count: 0
    }
  },

  methods: {
    increment () {
      this.count++
    }
  }
}
</script>
```

И создайте файл теста, названный `test/Counter.spec.js` со следующим кодом:

```js
import { shallow } from '@vue/test-utils'
import Counter from '../src/Counter.vue'

describe('Counter.vue', () => {
  it('увеличивает счётчик по нажатию кнопки', () => {
    const wrapper = shallow(Counter)
    wrapper.find('button').trigger('click')
    expect(wrapper.find('div').text()).toMatch('1')
  })
})
```

И теперь мы можем запустить тест:

```
npm run unit
```

Ура, мы запустили наши тесты!

### Покрытие кода (Coverage)

Для настройки покрытия кода в mocha-webpack, следуйте [инструкции по настройке покрытия кода mocha-webpack](https://github.com/zinserjan/mocha-webpack/blob/master/docs/guides/code-coverage.md).

### Ресурсы

- [Пример проекта для этой конфигурации](https://github.com/vuejs/vue-test-utils-mocha-webpack-example)
- [Mocha](https://mochajs.org/)
- [mocha-webpack](http://zinserjan.github.io/mocha-webpack/)
- [Chai](http://chaijs.com/)
- [Sinon](http://sinonjs.org/)
- [jest/expect](http://facebook.github.io/jest/docs/en/expect.html#content)
