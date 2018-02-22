# Опции монтирования

Опции для `mount` и `shallow`. Объект опций может содержать как настройки монтирования `vue-test-utils`, так и сырые опции Vue.

## Специальные опции монтирования `vue-test-utils`

- [`context`](#context)
- [`slots`](#slots)
- [`stubs`](#stubs)
- [`mocks`](#mocks)
- [`localVue`](#localvue)
- [`attachToDocument`](#attachtodocument)
- [`attrs`](#attrs)
- [`listeners`](#listeners)
- [`provide`](#provide)

### `context`

- Тип: `Object`

Передаёт контекст в функциональный компонент. Может использоваться только с функциональными компонентами.

Пример:

```js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = mount(Component, {
  context: {
    props: { show: true },
    children: [Foo, Bar]
  }
})

expect(wrapper.is(Component)).toBe(true)
```

### `slots`

- Тип: `{ [name: string]: Array<Component>|Component|string }`

Предоставляет объект с содержимым слотов компоненту. Ключ соответствует имени слота. Значение может быть компонентом, массивом компонентов или строковым шаблоном, или текстом.

Пример:

```js
import Foo from './Foo.vue'
import Bar from './Bar.vue'

const wrapper = shallow(Component, {
  slots: {
    default: [Foo, Bar],
    fooBar: Foo, // будет соответствовать `<slot name="FooBar" />`
    foo: '<div />',
    bar: 'bar'
  }
})
expect(wrapper.find('div')).toBe(true)
```

#### Передача текста

Вы можете передать текст в `slots`.
Для этого есть одно ограничение.

Это не поддерживается PhantomJS.
Используйте [Puppeteer](https://github.com/karma-runner/karma-chrome-launcher#headless-chromium-with-puppeteer).

### `stubs`

- Тип: `{ [name: string]: Component | boolean } | Array<string>`

Заглушки дочерних компонентов. Может быть массивом имен компонентов заменяемых заглушкой, или объектом.

Пример:

```js
import Foo from './Foo.vue'

mount(Component, {
  stubs: ['registered-component']
})

shallow(Component, {
  stubs: {
    // заглушка со специальной реализацией
    'registered-component': Foo,
    // создание обычной заглушки
    'another-component': true
  }
})
```

### `mocks`

- Тип: `Object`

Дополнительные свойства для экземпляра. Полезно при создании моков глобальных инъекций.

Пример:

```js
const $route = { path: 'http://www.example-path.com' }
const wrapper = shallow(Component, {
  mocks: {
    $route
  }
})
expect(wrapper.vm.$route.path).toBe($route.path)
```

### `localVue`

- Тип: `Vue`

Локальная копия Vue, созданная с помощью [`createLocalVue`](./createLocalVue.md) для использования при монтировании компонента. Установка плагинов на этой копии `Vue` предотвращает загрязнение оригинальной копии `Vue`.

Пример:

```js
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

const routes = [
  { path: '/foo', component: Foo }
]

const router = new VueRouter({
  routes
})

const wrapper = mount(Component, {
  localVue,
  router
})
expect(wrapper.vm.$route).toBeInstanceOf(Object)
```

### `attachToDocument`

- Тип: `boolean`
- По умолчанию: `false`

Компонент будет прикрепляться к DOM при рендеринге, если установлено в `true`. Это может использоваться с [`hasStyle`](wrapper/hasStyle.md) для проверки селекторов CSS на нескольких элементах.

### `attrs`

- Тип: `Object`

Устанавливает объект `$attrs` на экземпляре компонента.

### `listeners`

- Тип: `Object`

Устанавливает объект `$listeners` на экземпляре компонента.

### `provide`

- Тип: `Object`

Передаёт свойства в компоненты для использования в инъекциях. См. [provide/inject](https://ru.vuejs.org/v2/api/#provide-inject).

## Другие опции

Если в параметрах для `mount` и `shallow` содержатся другие опции, отличные от опций монтирования, опции компонента будут перезаписаны с помощью [extends](https://ru.vuejs.org/v2/api/#extends).

```js
const Component = {
  template: '<div>{{ foo() }}{{ bar() }}{{ baz() }}</div>',
  methods: {
    foo () {
      return 'a'
    },
    bar () {
      return 'b'
    }
  }
}
const options = {
  methods: {
    bar () {
      return 'B'
    },
    baz () {
      return 'C'
    }
  }
}
const wrapper = mount(Component, options)
expect(wrapper.text()).toBe('aBC')
```