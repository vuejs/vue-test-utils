# Опции монтирования

Опции для `mount` и `shallowMount`. Объект опций может содержать как настройки монтирования Vue Test Utils, так и другие опции Vue.

- [`context`](#context)
- [`slots`](#slots)
- [`scopedSlots`](#scopedslots)
- [`stubs`](#stubs)
- [`mocks`](#mocks)
- [`localVue`](#localvue)
- [`attachToDocument`](#attachtodocument)
- [`attrs`](#attrs)
- [`listeners`](#listeners)
- [`provide`](#provide)
- [`sync`](#sync)

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

const wrapper = shallowMount(Component, {
  slots: {
    default: [Foo, Bar],
    fooBar: Foo, // будет соответствовать `<slot name="FooBar" />`
    foo: '<div />',
    bar: 'bar'
  }
})
expect(wrapper.find('div')).toBe(true)
```

## scopedSlots

- type: `{ [name: string]: string }`

Предоставляет объект содержимое слотов с ограниченной областью видимости для компонента. Ключ соответствует имени слота. Значение может быть строкой шаблона.

Есть три ограничения.

* Эта опция поддерживается только с vue@2.5+.

* Вы не можете использовать тег `<template>` в качестве корневого элемента в опции `scopedSlots`.

* Это не поддерживает PhantomJS.  
Вы можете использовать [Puppeteer](https://github.com/karma-runner/karma-chrome-launcher#headless-chromium-with-puppeteer) как альтернативу.

Пример:

```js
const wrapper = shallowMount(Component, {
  scopedSlots: {
    foo: '<p slot-scope="props">{{props.index}},{{props.text}}</p>'
  }
})
expect(wrapper.find('#fooWrapper').html()).toBe(
  `<div id="fooWrapper"><p>0,text1</p><p>1,text2</p><p>2,text3</p></div>`
)
```

### `stubs`

- Тип: `{ [name: string]: Component | boolean } | Array<string>`

Заглушки дочерних компонентов. Может быть массивом имен компонентов заменяемых заглушкой, или объектом. Если `stubs` массив, каждая заглушка - `<${component name}-stub>`.

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

Компонент будет прикрепляться к DOM при рендеринге, если установлено в `true`.

### `attrs`

- Тип: `Object`

Устанавливает объект `$attrs` на экземпляре компонента.

### `listeners`

- Тип: `Object`

Устанавливает объект `$listeners` на экземпляре компонента.

### `provide`

- Тип: `Object`

Передаёт свойства в компоненты для использования в инъекциях. См. [provide/inject](https://ru.vuejs.org/v2/api/#provide-inject).

## sync

- type: `boolean`
- default: `true`

Когда `sync` равняется `true`, Vue-компонент рендериться синхронно.  
Когда `sync` равняется `false`, Vue-компонент рендериться асинхронно.

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