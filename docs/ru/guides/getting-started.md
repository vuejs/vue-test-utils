# Введение

## Настройка

Для быстрого старта работы с `vue-test-utils`, клонируйте наш демонстрационный репозиторий с базовыми настройками и установите зависимости:

``` bash
git clone https://github.com/vuejs/vue-test-utils-getting-started
cd vue-test-utils-getting-started
npm install
```

Вы увидите, что проект содержит простой компонент `counter.js`:

```js
// counter.js

export default {
  template: `
    <div>
      <span class="count">{{ count }}</span>
      <button @click="increment">Increment</button>
    </div>
  `,

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
```

### Монтирование компонентов

`vue-test-utils` тестирует компоненты Vue монтируя их изолированно, создавая моки необходимых входных данных (входные параметры, инъекции и пользовательские события) и выполняя проверки над результатом (результат рендеринга, вызванные пользовательские события).

Примонтированные компоненты возвращаются внутри [Wrapper](./api/wrapper.md), который предоставляет множество  удобных методов для манипулирования, перемещения и различных запросов для экземпляра компонента Vue.

Вы можете создавать wrapper с помощью метода `mount`. Давайте создадим файл `test.js`:

```js
// test.js

// Импортируем метод mount() из vue-test-utils
// и компонент, который хотим протестировать
import { mount } from 'vue-test-utils'
import Counter from './counter'

// Теперь монтируем компонент и у нас появляется wrapper
const wrapper = mount(Counter)

// Вы можете получить доступ к экземпляру Vue через wrapper.vm
const vm = wrapper.vm

// Чтобы изучить wrapper подробнее, просто выведите его в консоль
// и ваши приключения с vue-test-utils начнутся
console.log(wrapper)
```

### Тестирование отрендеренного HTML компонента

Теперь, когда у нас есть wrapper, первой вещью, которую мы можем захотеть проверить что отрендеренный HTML компонента соответствует нашим ожиданиям.

```js
import { mount } from 'vue-test-utils'
import Counter from './counter'

describe('Counter', () => {
  // Теперь монтируем компонент и получаем wrapper
  const wrapper = mount(Counter)

  it('renders the correct markup', () => {
    expect(wrapper.html()).toContain('<span class="count">0</span>')
  })

  // также легко проверить наличие других элементов
  it('has a button', () => {
    expect(wrapper.contains('button')).toBe(true)
  })
})
```

Теперь запустите тесты командой `npm test`. Вы должны увидеть, что все тесты проходят успешно.

### Симуляция пользовательских действий

Наш счётчик должен увеличивать значение, когда пользователь нажимает кнопку. Чтобы симулировать это поведение, нам необходимо сначала получить кнопку с помощью `wrapper.find()`, который возвращает **wrapper для элемента кнопки**. Мы можем симулировать клик с помощью вызова `.trigger()` на wrapper кнопки:

```js
it('button click should increment the count', () => {
  expect(wrapper.vm.count).toBe(0)
  const button = wrapper.find('button')
  button.trigger('click')
  expect(wrapper.vm.count).toBe(1)
})
```

### What about `nextTick`?

Vue batches pending DOM updates and applies them asynchronously to prevent unnecessary re-renders caused by multiple data mutations. This is why in practice we often have to use `Vue.nextTick` to wait until Vue has performed the actual DOM update after we trigger some state change.

To simplify usage, `vue-test-utils` applies all updates synchronously so you don't need to use `Vue.nextTick` to wait for DOM updates in your tests.

*Note: `nextTick` is still necessary when you need to explictly advance the event loop, for operations such as asynchronous callbacks or promise resolution.*

## Что дальше

- Интегрируйте `vue-test-utils` в ваш проект выбрав [программу для запуска тестов](./choosing-a-test-runner.md)
- Прочитайте больше об [общих техниках и советах при написании тестов](./common-tips.md)
