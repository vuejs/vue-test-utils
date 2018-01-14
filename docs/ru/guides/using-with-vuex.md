# Использование с Vuex

В этом руководстве мы рассмотрим как тестировать Vuex в компонентах с `vue-test-utils`.

## Создание моков для действий

Давайте посмотрим на часть кода.

Это компонент который мы хотим протестировать. Он вызывает действие Vuex.

``` html
<template>
  <div class="text-align-center">
    <input type="text" @input="actionInputIfTrue" />
    <button @click="actionClick()">Нажми</button>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default{
  methods: {
    ...mapActions([
      'actionClick'
    ]),
    actionInputIfTrue: function actionInputIfTrue (event) {
      const inputValue = event.target.value
      if (inputValue === 'input') {
        this.$store.dispatch('actionInput', { inputValue })
      }
    }
  }
}
</script>
```

Для целей этого теста нам всё равно, что делает действие или как выглядит структура хранилища. Мы должны просто узнать, что это действие вызывается когда должно, и что оно вызывается с ожидаемым значением.

Чтобы протестировать это, нам нужно передать мок хранилища в Vue, когда мы отделяем наш компонент.

Вместо передачи хранилища в базовый конструктор Vue, мы можем передать его в [localVue](../api/options.md#localvue). localVue — это изолированный конструктор Vue, в который мы можем вносить изменения без влияния на глобальный конструктор Vue.

Давайте посмотрим, как это выглядит:

``` js
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Actions from '../../../src/components/Actions'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Actions.vue', () => {
  let actions
  let store

  beforeEach(() => {
    actions = {
      actionClick: jest.fn(),
      actionInput: jest.fn()
    }
    store = new Vuex.Store({
      state: {},
      actions
    })
  })

  it('вызывает действие хранилища "actionInput" когда значение поля "input" и было событие "input"', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'input'
    input.trigger('input')
    expect(actions.actionInput).toHaveBeenCalled()
  })

  it('не вызывает действие хранилища "actionInput" когда значение поля отлично от "input" и было событие "input"', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'not input'
    input.trigger('input')
    expect(actions.actionInput).not.toHaveBeenCalled()
  })

  it('вызывает действие хранилища "actionClick" по нажатию кнопки', () => {
    const wrapper = shallow(Actions, { store, localVue })
    wrapper.find('button').trigger('click')
    expect(actions.actionClick).toHaveBeenCalled()
  })
})
```

Что тут происходит? Сначала мы говорим Vue использовать Vuex с помощью метода `localVue.use`. Это всего лишь обёртка вокруг `Vue.use`.

Затем мы создаём мок хранилища вызовом `new Vuex.store` с нашими заготовленными значениями. Мы передаём ему только дейсвтия, так как это всё что нам необходимо.

Действия реализуются с помощью [mock-функций jest](https://facebook.github.io/jest/docs/en/mock-functions.html). Эти mock-функции предоставляют нам методы для проверки, вызывались ли действия или нет.

Затем мы можем проверить в наших тестах, что заглушка действия была вызвана когда ожидалось.

Теперь способ, которым мы определяем наше хранилище выглядит немного необычным для вас.

Мы используем `beforeEach`, чтобы убедиться, что у нас есть чистое хранилище перед каждым тестом. `beforeEach` — это хук в mocha, который вызывается перед каждым тестом. В нашем тесте мы переназначаем значения переменных хранилища. Если бы мы этого не сделали, mock-функции нужно было бы автоматически сбрасывать. Это также позволяет нам изменять состояние в наших тестах, не влияя на последующие тесты.

Самое важно, что следует отметить в этом тесте — то что **мы создаём мок хранилища Vuex и затем передаём его в `vue-test-utils`**.

Отлично, теперь мы можем создавать моки действий, давайте посмотрим на создание моков для геттеров.

## Создание моков для геттеров

``` html
<template>
  <div>
    <p v-if="inputValue">{{inputValue}}</p>
    <p v-if="clicks">{{clicks}}</p>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default{
  computed: mapGetters([
    'clicks',
    'inputValue'
  ])
}
</script>
```

Это довольно простой компонент. Он отображает результат геттеров `clicks` и `inputValue`. Опять же, нас не волнует что возвращают эти геттеры — только то, что их результат будет корректно отображён.

Давайте посмотрим на тест:

``` js
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Actions from '../../../src/components/Getters'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Getters.vue', () => {
  let getters
  let store

  beforeEach(() => {
    getters = {
      clicks: () => 2,
      inputValue: () => 'input'
    }

    store = new Vuex.Store({
      getters
    })
  })

  it('Отображает "state.inputValue" в первом теге p', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(getters.inputValue())
  })

  it('Отображает "state.clicks" во втором теге p', () => {
    const wrapper = shallow(Actions, { store, localVue })
    const p = wrapper.findAll('p').at(1)
    expect(p.text()).toBe(getters.clicks().toString())
  })
})
```

Этот тест очень похож на тест действий. Мы создаём мок хранилища перед каждым тестом, передаём его в качестве опции когда вызываем `shallow`, и проверяем что значение вернувшееся из мока-геттера отображается.

Это здорово, но что, если мы хотим проверить, что наши геттеры возвращают правильную часть нашего состояния?

## Создание моков с модулями

[Модули](https://vuex.vuejs.org/ru/modules.html) полезны для разделения нашего хранилища на управляемые части. Они также экспортируют геттеры. Мы можем использовать их в наших тестах.

Давайте взглянем на наш компонент:

``` html
<template>
  <div>
    <button @click="moduleActionClick()">Нажми</button>
    <p>{{moduleClicks}}</p>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default{
  methods: {
    ...mapActions([
      'moduleActionClick'
    ])
  },

  computed: mapGetters([
    'moduleClicks'
  ])
}
</script>
```

Простой компонент, который содержит одно действие и один геттер.

И тест:

``` js
import { shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Modules from '../../../src/components/Modules'
import module from '../../../src/store/module'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('Modules.vue', () => {
  let actions
  let state
  let store

  beforeEach(() => {
    state = {
      module: {
        clicks: 2
      }
    }

    actions = {
      moduleActionClick: jest.fn()
    }

    store = new Vuex.Store({
      state,
      actions,
      getters: module.getters
    })
  })

  it('вызывает действие "moduleActionClick" при нажатии кнопки', () => {
    const wrapper = shallow(Modules, { store, localVue })
    const button = wrapper.find('button')
    button.trigger('click')
    expect(actions.moduleActionClick).toHaveBeenCalled()
  })

  it('отображает "state.inputValue" в первом теге p', () => {
    const wrapper = shallow(Modules, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(state.module.clicks.toString())
  })
})
```

### Ресурсы

- [Пример проекта для этого руководства](https://github.com/eddyerburgh/vue-test-utils-vuex-example)
- [`localVue`](../api/options.md#localvue)
- [`createLocalVue`](../api/createLocalVue.md)
