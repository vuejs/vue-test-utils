## Использование с TypeScript

> Пример проекта для этой конфигурации доступен на [GitHub](https://github.com/vuejs/vue-test-utils-typescript-example).

TypeScript — популярное надмножество JavaScript, которое добавляет типы и классы поверх обычного JS. Vue Test Utils включает типы в распределённый пакет, поэтому он хорошо работает с TypeScript.

В этом руководстве мы рассмотрим, как настроить тестовую конфигурацию для TypeScript-проекта с использованием Jest и Vue Test Utils из базовой настройки Vue CLI TypeScript.

### Добавление TypeScript

Сначала вам нужно создать проект. Если у вас нет Vue CLI, установите его глобально:

```shell
$ npm install -g @vue/cli
```

И создайте проект, запустив следующую команду:

```shell
$ vue create hello-world
```

В командной строке выберите `Manually select features`, выберите `TypeScript` и нажмите клавишу ввода. Это создаст проект с уже настроенным для работы TypeScript.

::: tip ПРИМЕЧАНИЕ
Если вы хотите получить более подробное руководство по настройке Vue с помощью TypeScript, ознакомьтесь с [руководством для начинающих по TypeScript во Vue](https://github.com/Microsoft/TypeScript-Vue-Starter).
:::

Следующий шаг — добавить Jest в проект.

### Настройка Jest

Jest — это программа для запуска тестов, разработанный Facebook и направленный на предоставление многофункционального решения для модульного тестирования. Вы можете узнать больше о Jest на его [официальной документации](https://jestjs.io/).

Установить Jest и Vue Test Utils:

```bash
$ npm install --save-dev jest @vue/test-utils
```

Затем определите команду `test:unit` в секции scripts в `package.json`.

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

### Обработка однофайловых компонентов в Jest

Чтобы научить Jest обрабатывать файлы с расширением `.vue`, нам нужно установить и настроить препроцессор `vue-jest`:

```bash
npm install --save-dev vue-jest
```

Затем создайте блок `jest` в `package.json`:

```json
{
  // ...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "ts",
      "json",
      // указываем Jest обрабатывать файлы с расширением `*.vue`
      "vue"
    ],
    "transform": {
      // обработка файлов с расширением `*.vue` с помощью `vue-jest`
      ".*\\.(vue)$": "vue-jest"
    },
    "testURL": "http://localhost/"
  }
}
```

### Настройка TypeScript для Jest

Чтобы использовать файлы TypeScript в тестах, нам нужно настроить Jest для компиляции TypeScript. Для этого нам нужно установить `ts-jest`:

```bash
$ npm install --save-dev ts-jest
```

Затем нам нужно указать Jest обрабатывать тестовые файлы TypeScript с помощью `ts-jest`, добавив запись в `jest.transform` в `package.json`:

```json
{
  // ...
  "jest": {
    // ...
    "transform": {
      // ...
      // обработка файлов с расширением `*.ts` с помощью `ts-jest`
      "^.+\\.tsx?$": "ts-jest"
    }
    // ...
  }
}
```

### Размещение тестовых файлов

По умолчанию Jest будет рекурсивно выбирать все файлы с расширением `.spec.js` или `.test.js` по всему проекту.

Чтобы запустить тестовые файлы с расширением `.ts`, нам нужно изменить `testRegex` в разделе конфигурации файла `package.json`.

Добавьте следующее в поле `jest` в `package.json`:

```json
{
  // ...
  "jest": {
    // ...
    "testRegex": "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$"
  }
}
```

Jest рекомендует создать каталог `__tests__` рядом с тестируемым кодом, но не стесняйтесь структурировать ваши тесты по своему усмотрению. Просто помните, что Jest создаст каталог `__snapshots__` рядом с тестовыми файлами, которые выполняют тестирование моментальными снимками.

### Написание модульного теста

Теперь у нас есть проект, пришло время написать тест.

Создайте файл `src/components/__tests__/HelloWorld.spec.ts` и добавьте следующий код:

```js
// src/components/__tests__/HelloWorld.spec.ts
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld.vue', () => {
  test('отрисовывает props.msg, если они переданы', () => {
    const msg = 'new message'
    const wrapper = shallowMount(HelloWorld, {
      propsData: { msg }
    })
    expect(wrapper.text()).toMatch(msg)
  })
})
```

Это все, что нам нужно сделать, чтобы заставить TypeScript и Vue Test Utils работать вместе!

### Ресурсы

- [Пример проекта для этой конфигурации](https://github.com/vuejs/vue-test-utils-typescript-example)
- [Jest](https://jestjs.io/)
