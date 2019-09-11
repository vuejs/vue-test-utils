# Использование с Vuex

В этом руководстве мы рассмотрим как тестировать Vuex в компонентах с Vue Test Utils и как подходить к тестированию хранилища Vuex.

## Тестирование Vuex в компонентах

### Создание моков для действий

Давайте посмотрим на часть кода.

Это компонент который мы хотим протестировать. Он вызывает действие Vuex.

```html
<template>
  <div class="text-align-center">
    <input type="text" @input="actionInputIfTrue" />
    <button @click="actionClick()">Нажми</button>
  </div>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    methods: {
      ...mapActions(['actionClick']),
      actionInputIfTrue: function actionInputIfTrue(event) {
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

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
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
      actions
    })
  })

  it('вызывает "actionInput", когда значение события — "input"', () => {
    const wrapper = shallowMount(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'input'
    input.trigger('input')
    expect(actions.actionInput).toHaveBeenCalled()
  })

  it('не вызывает "actionInput", когда значение события не "input"', () => {
    const wrapper = shallowMount(Actions, { store, localVue })
    const input = wrapper.find('input')
    input.element.value = 'not input'
    input.trigger('input')
    expect(actions.actionInput).not.toHaveBeenCalled()
  })

  it('вызывает действие хранилища "actionClick" по нажатию кнопки', () => {
    const wrapper = shallowMount(Actions, { store, localVue })
    wrapper.find('button').trigger('click')
    expect(actions.actionClick).toHaveBeenCalled()
  })
})
```

Что тут происходит? Сначала мы указываем Vue использовать Vuex с помощью метода `localVue.use`. Это всего лишь обёртка вокруг `Vue.use`.

Затем мы создаём мок хранилища вызовом `new Vuex.store` с нашими заготовленными значениями. Мы передаём ему только действия, так как это всё, что нам необходимо.

Действия реализуются с помощью [mock-функций jest](https://jestjs.io/docs/en/mock-functions.html). Эти mock-функции предоставляют нам методы для проверки, вызывались ли действия или нет.

Затем мы можем проверить в наших тестах, что заглушка действия была вызвана когда ожидалось.

Теперь способ, которым мы определяем наше хранилище выглядит немного необычным для вас.

Мы используем `beforeEach`, чтобы убедиться, что у нас есть чистое хранилище перед каждым тестом. `beforeEach` — это хук в mocha, который вызывается перед каждым тестом. В нашем тесте мы переназначаем значения переменных хранилища. Если бы мы этого не сделали, mock-функции нужно было бы автоматически сбрасывать. Это также позволяет нам изменять состояние в наших тестах, не влияя на последующие тесты.

Самое важно, что следует отметить в этом тесте — то что **мы создаём мок хранилища Vuex и затем передаём его в `vue-test-utils`**.

Отлично, теперь мы можем создавать моки действий, давайте посмотрим на создание моков для геттеров.

### Создание моков для геттеров

```html
<template>
  <div>
    <p v-if="inputValue">{{inputValue}}</p>
    <p v-if="clicks">{{clicks}}</p>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    computed: mapGetters(['clicks', 'inputValue'])
  }
</script>
```

Это довольно простой компонент. Он отображает результат геттеров `clicks` и `inputValue`. Опять же, нас не волнует что возвращают эти геттеры — только то, что их результат будет корректно отображён.

Давайте посмотрим на тест:

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Getters from '../../../src/components/Getters'

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
    const wrapper = shallowMount(Getters, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(getters.inputValue())
  })

  it('Отображает "state.clicks" во втором теге p', () => {
    const wrapper = shallowMount(Getters, { store, localVue })
    const p = wrapper.findAll('p').at(1)
    expect(p.text()).toBe(getters.clicks().toString())
  })
})
```

Этот тест очень похож на тест действий. Мы создаём мок хранилища перед каждым тестом, передаём его в качестве опции когда вызываем `shallowMount`, и проверяем что значение вернувшееся из мока-геттера отображается.

Это здорово, но что, если мы хотим проверить, что наши геттеры возвращают корректную часть нашего состояния?

### Создание моков с модулями

[Модули](https://vuex.vuejs.org/ru/guide/modules.html) полезны для разделения нашего хранилища на управляемые части. Они также экспортируют геттеры. Мы можем использовать их в наших тестах.

Давайте взглянем на наш компонент:

```html
<template>
  <div>
    <button @click="moduleActionClick()">Нажми</button>
    <p>{{moduleClicks}}</p>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex'

  export default {
    methods: {
      ...mapActions(['moduleActionClick'])
    },

    computed: mapGetters(['moduleClicks'])
  }
</script>
```

Простой компонент, который содержит одно действие и один геттер.

И тест:

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import MyComponent from '../../../src/components/MyComponent'
import myModule from '../../../src/store/myModule'

const localVue = createLocalVue()

localVue.use(Vuex)

describe('MyComponent.vue', () => {
  let actions
  let state
  let store

  beforeEach(() => {
    state = {
      clicks: 2
    }

    actions = {
      moduleActionClick: jest.fn()
    }

    store = new Vuex.Store({
      modules: {
        myModule: {
          state,
          actions,
          getters: myModule.getters
        }
      }
    })
  })

  it('вызывает действие "moduleActionClick" при нажатии кнопки', () => {
    const wrapper = shallowMount(MyComponent, { store, localVue })
    const button = wrapper.find('button')
    button.trigger('click')
    expect(actions.moduleActionClick).toHaveBeenCalled()
  })

  it('отображает "state.inputValue" в первом теге p', () => {
    const wrapper = shallowMount(MyComponent, { store, localVue })
    const p = wrapper.find('p')
    expect(p.text()).toBe(state.clicks.toString())
  })
})
```

### Тестирование хранилища Vuex

Существуют два подхода к тестированию хранилища Vuex. Первый подход заключается в модульном тестировании геттеров, изменений и действий отдельно. Второй подход — создать хранилище и протестировать его. Мы рассмотрим оба подхода.

Чтобы понять, как протестировать хранилище Vuex, мы создадим простое хранилище-счётчик. В хранилище есть мутация `increment` и геттер `evenOrOdd`.

```js
// mutations.js
export default {
  increment(state) {
    state.count++
  }
}
```

```js
// getters.js
export default {
  evenOrOdd: state => (state.count % 2 === 0 ? 'even' : 'odd')
}
```

### Тестирование геттеров, мутаций и действий отдельно

Геттеры, мутации и действия — JavaScript-функции, поэтому мы можем протестировать их без использования Vue Test Utils и Vuex.

Преимущество тестирования геттеров, мутаций и действий по отдельности заключается в том, как ваши модульные тесты подробно описаны. Когда они терпят неудачу, вы точно знаете, что не так с вашим кодом. Недостатком является то, что вы нужны моки функций Vuex, таких как `commit` и `dispatch`. Это может привести к ситуации, когда модульные тесты проходят, но production-код терпит неудачу, потому что моки некорректные.

Мы создадим два тестовых файла: `mutations.spec.js` и `getters.spec.js`:

Сначала давайте протестируем мутации `increment`:

```js
// mutations.spec.js

import mutations from './mutations'

test('мутация "increment" увеличивает "state.count" на 1', () => {
  const state = {
    count: 0
  }
  mutations.increment(state)
  expect(state.count).toBe(1)
})
```

Теперь давайте протестируем геттер `evenOrOdd`. Мы можем протестировать его, путём создания мока для `state`, вызвав геттер с `state` и проверкой, что возвращается корректное значение.

```js
// getters.spec.js

import getters from './getters'

test('evenOrOdd возвращает even, если в state.count находится even', () => {
  const state = {
    count: 2
  }
  expect(getters.evenOrOdd(state)).toBe('even')
})

test('evenOrOdd возвращает odd, если в state.count находится odd', () => {
  const state = {
    count: 1
  }
  expect(getters.evenOrOdd(state)).toBe('odd')
})
```

### Тестирование запущенного хранилища

Другой подход к тестированию хранилища Vuex — это создание запущенного хранилища с использованием конфигурации хранилища.

Преимущество тестирования создания экземпляра запущенного хранилища заключается в том,что нам не нужны моки для функций Vuex.

Недостатком является то, что если тест ломается, может быть трудно найти, в чём проблема.

Давайте напишем тест. Когда мы создаём, мы будем использовать `localVue`, чтобы избежать загрязнения базового конструктора Vue. Тест создаёт хранилище, используя экспорт `store-config.js`:

```js
// store-config.js

import mutations from './mutations'
import getters from './getters'

export default {
  state: {
    count: 0
  },
  mutations,
  getters
}
```

```js
// store-config.spec.js

import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import storeConfig from './store-config'
import { cloneDeep } from 'lodash'

test('инкрементирует значение счётчика, когда происходит инкремент', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  const store = new Vuex.Store(cloneDeep(storeConfig))
  expect(store.state.count).toBe(0)
  store.commit('increment')
  expect(store.state.count).toBe(1)
})

test('обновляет геттер evenOrOdd, когда происходит инкремент', () => {
  const localVue = createLocalVue()
  localVue.use(Vuex)
  const store = new Vuex.Store(cloneDeep(storeConfig))
  expect(store.getters.evenOrOdd).toBe('even')
  store.commit('increment')
  expect(store.getters.evenOrOdd).toBe('odd')
})
```

Обратите внимание, что мы используем `cloneDeep` для клонирования конфигурации хранилища перед созданием хранилища с ним. Это связано с тем, что Vuex мутирует объект с опциями, используемый для создания хранилища. Чтобы убедиться, у нас есть пустое хранилище в каждом тесте, нам нужно клонировать объект `storeConfig`.

### Ресурсы

- [Пример проекта тестирования компонентов](https://github.com/eddyerburgh/vue-test-utils-vuex-example)
- [Пример проекта тестирования хранилища](https://github.com/eddyerburgh/testing-vuex-store-example)
- [`localVue`](../api/options.md#localvue)
- [`createLocalVue`](../api/createLocalVue.md)
