# Тестирование асинхронной логики

Чтобы упростить тестирование, `vue-test-utils` применяет обновления DOM _синхронно_. Однако, есть некоторые тонкости, когда вам необходимо протестировать компонент с асинхронным поведением, таким как коллбэки или промисы.

Одними из самых распространённых поведений являются запросы к API и действия Vuex. В примерах ниже будет показано как протестировать метод, который делает запрос к API. В этом примере используется Jest для запуска тестов и мок для HTTP-библиотеки `axios`. Подробнее о использовании моков в Jest можно прочитать [здесь](https://facebook.github.io/jest/docs/en/manual-mocks.html#content).

Реализация мока для `axios` выглядит так:

``` js
export default {
  get: () => new Promise(resolve => {
    resolve({ data: 'value' })
  })
}
```

Компонент ниже делает вызов к API при нажатии кнопки и сохраняет полученный ответ в `value`.

``` html
<template>
  <button @click="fetchResults" />
</template>

<script>
  import axios from 'axios'

  export default {
    data () {
      return {
        value: null
      }
    },

    methods: {
      async fetchResults () {
        const response = await axios.get('mock/service')
        this.value = response.data
      }
    }
  }
</script>
```

Тест можно написать следующим образом:

``` js
import { shallow } from '@vue/test-utils'
import Foo from './Foo'
jest.mock('axios')

test('Foo', () => {
  it('делает асинхронный запрос при нажатии кнопки', () => {
    const wrapper = shallow(Foo)
    wrapper.find('button').trigger('click')
    expect(wrapper.vm.value).toBe('value')
  })
})
```

В настоящее время этот тест не будет успешно проходить, потому что проверка значения вызывается до разрешения промиса `fetchResults`. Большинство библиотек для модульного тестирования предоставляют коллбэк, чтобы предоставить возможность определять когда тест должен будет завершаться. Jest и Mocha используют `done`. Мы можем использовать `done` в комбинации с `$nextTick` или `setTimeout`, чтобы гарантировать, что любые промисы будут разрешены перед проверками.

``` js
test('Foo', () => {
  it('делает асинхронный запрос при нажатии кнопки', (done) => {
    const wrapper = shallow(Foo)
    wrapper.find('button').trigger('click')
    wrapper.vm.$nextTick(() => {
      expect(wrapper.vm.value).toBe('value')
      done()
    })
  })
})
```

Необходимость `$nextTick` или `setTimeout` требуется для прохождения теста, потому что очередь микрозадач, в которой обрабатываются промисы, обрабатывается до очереди задач, где обрабатываются `$nextTick` и `setTimeout`. Это означает, что к моменту запуска `$nexTick` и `setTimeout`, будут выполнены любые коллбэки промисов. См. [здесь](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/) для более подробного объяснения.

Другое решение — использовать `async` функцию и npm-пакет `flush-promises`. `flush-promises` сбрасывает все ожидаемые промисы. Вы можете использовать `await` вызов для `flushPromises` чтобы очистить все ожидаемые промисы и улучшить читаемость вашего теста.

Обновлённый тест будет выглядеть так:

``` js
import { shallow } from '@vue/test-utils'
import flushPromises from 'flush-promises'
import Foo from './Foo'
jest.mock('axios')

test('Foo', () => {
  it('делает асинхронный запрос при нажатии кнопки', async () => {
    const wrapper = shallow(Foo)
    wrapper.find('button').trigger('click')
    await flushPromises()
    expect(wrapper.vm.value).toBe('value')
  })
})
```

Подобная техника может применяться и для действий Vuex, которые возвращают promise по умолчанию.
