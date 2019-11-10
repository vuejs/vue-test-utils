# Опции монтирования

Опции для `mount` и `shallowMount`. Объект опций может содержать как настройки монтирования Vue Test Utils, так и другие опции Vue.

:::tip СОВЕТ
Кроме опций, описанных ниже, объект `options` может содержать любую опцию, которую можно указать при вызове `new Vue ({ /* опции здесь */ })`.
Эти опции будут объединены с существующими опциями компонента при монтировании с помощью `mount` / `shallowMount`

[См. другие опции в примере](#other-options)
:::

- [Опции монтирования](#%D0%BE%D0%BF%D1%86%D0%B8%D0%B8-%D0%BC%D0%BE%D0%BD%D1%82%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F)
  - [context](#context)
  - [slots](#slots)
  - [scopedSlots](#scopedslots)
  - [stubs](#stubs)
  - [mocks](#mocks)
  - [localVue](#localvue)
  - [attachToDocument](#attachtodocument)
  - [attrs](#attrs)
  - [propsData](#propsdata)
  - [listeners](#listeners)
  - [parentComponent](#parentcomponent)
  - [provide](#provide)
  - [Другие опции](#%D0%B4%D1%80%D1%83%D0%B3%D0%B8%D0%B5-%D0%BE%D0%BF%D1%86%D0%B8%D0%B8)

## context

- Тип: `Object`

Передаёт контекст в функциональный компонент. Может использоваться только с [функциональными компонентами](https://ru.vuejs.org/v2/guide/render-function.html#%D0%A4%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D0%BE%D0%BD%D0%B0%D0%BB%D1%8C%D0%BD%D1%8B%D0%B5-%D0%BA%D0%BE%D0%BC%D0%BF%D0%BE%D0%BD%D0%B5%D0%BD%D1%82%D1%8B).

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

## slots

- Тип: `{ [name: string]: Array<Component>|Component|string }`

Предоставляет объект с содержимым слотов компоненту. Ключ соответствует имени слота. Значение может быть компонентом, массивом компонентов или строковым шаблоном, или текстом.

Пример:

```js
import Foo from './Foo.vue'

const bazComponent = {
  name: 'baz-component',
  template: '<p>baz</p>'
}

const wrapper = shallowMount(Component, {
  slots: {
    default: [Foo, '<my-component />', 'text'],
    fooBar: Foo, // будет соответствовать `<slot name="FooBar" />`
    foo: '<div />',
    bar: 'bar',
    baz: bazComponent,
    qux: '<my-component />'
  }
})

expect(wrapper.find('div')).toBe(true)
```

## scopedSlots

- Тип: `{ [name: string]: string|Function }`

Предоставляет объект с содержимым слотов с ограниченной областью видимости для компонента. Ключ соответствует имени слота.

Вы можете установить имя входного параметра, используя атрибут slot-scope:

```js
shallowMount(Component, {
  scopedSlots: {
    foo: '<p slot-scope="foo">{{foo.index}},{{foo.text}}</p>'
  }
})
```

В противном случае входные параметры будут доступны как объект `props` при вычислении слота:

```js
shallowMount(Component, {
  scopedSlots: {
    default: '<p>{{props.index}},{{props.text}}</p>'
  }
})
```

Вы также можете передать функцию, которая принимает входные параметры в качестве аргумента:

```js
shallowMount(Component, {
  scopedSlots: {
    foo: function(props) {
      return this.$createElement('div', props.index)
    }
  }
})
```

Или вы можете использовать JSX. Если вы пишете JSX в методе, `this.$createElement` автоматически внедряется babel-plugin-transform-vue-jsx:

```js
shallowMount(Component, {
  scopedSlots: {
    foo(props) {
      return <div>{props.text}</div>
    }
  }
})
```

## stubs

- Тип: `{ [name: string]: Component | boolean } | Array<string>`

Заглушки дочерних компонентов. Может быть массивом имён компонентов заменяемых заглушкой, или объектом. Если `stubs` массив, каждая заглушка - `<${component name}-stub>`.

Пример:

```js
import Foo from './Foo.vue'

mount(Component, {
  stubs: ['registered-component']
})

shallowMount(Component, {
  stubs: {
    // заглушка со специальной реализацией
    'registered-component': Foo,
    // создание заглушки по умолчанию
    // в нашем случае имя компонента заглушки
    // по умолчанию - это another-component
    // заглушка по умолчанию - <${the component name of default stub}-stub>.
    'another-component': true
  }
})
```

## mocks

- Тип: `Object`

Дополнительные свойства для экземпляра. Полезно при создании моков глобальных инъекций.

Пример:

```js
const $route = { path: 'http://www.example-path.com' }
const wrapper = shallowMount(Component, {
  mocks: {
    $route
  }
})
expect(wrapper.vm.$route.path).toBe($route.path)
```

## localVue

- Тип: `Vue`

Локальная копия Vue, созданная с помощью [`createLocalVue`](./createLocalVue.md) для использования при монтировании компонента. Установка плагинов на этой копии `Vue` предотвращает загрязнение оригинальной копии `Vue`.

Пример:

```js
import { createLocalVue, mount } from '@vue/test-utils'
import VueRouter from 'vue-router'
import Foo from './Foo.vue'

const localVue = createLocalVue()
localVue.use(VueRouter)

const routes = [{ path: '/foo', component: Foo }]

const router = new VueRouter({
  routes
})

const wrapper = mount(Component, {
  localVue,
  router
})
expect(wrapper.vm.$route).toBeInstanceOf(Object)
```

## attachToDocument

- Тип: `boolean`
- По умолчанию: `false`

Компонент будет прикрепляться к DOM при рендеринге, если установлено в `true`.

Если компонент прикреплен к DOM, вы должны вызвать `wrapper.destroy()` в конце вашего теста для того, чтобы удалить отрисованные элементы из документа и удалить экземпляр компонента.

## attrs

- Тип: `Object`

Устанавливает объект `$attrs` на экземпляре компонента.

## propsData

- Тип: `Object`

Устанавливает входные параметры экземпляра компонента, когда он примонтирован.

Пример:

```js
const Component = {
  template: '<div>{{ msg }}</div>',
  props: ['msg']
}
const wrapper = mount(Component, {
  propsData: {
    msg: 'aBC'
  }
})
expect(wrapper.text()).toBe('aBC')
```

::: tip
Стоит отметить, что `propsData` относятся на самом деле к [API Vue](https://ru.vuejs.org/v2/api/#propsData),
а не к опции монтирования Vue Test Utils. Эта опция обрабатывается через [`extends`](https://ru.vuejs.org/v2/api/#extends).
Смотрите также [другие опции](#другие-опции).
:::

## listeners

- Тип: `Object`

Устанавливает объект `$listeners` на экземпляре компонента.

## parentComponent

- Тип: `Object`

Компонент для использования в качестве родительского для смонтированного компонента.

Пример:

```js
import Foo from './Foo.vue'

const wrapper = shallowMount(Component, {
  parentComponent: Foo
})
expect(wrapper.vm.$parent.$options.name).toBe('foo')
```

## provide

- Тип: `Object`

Передаёт свойства в компоненты для использования в инъекциях. См. [provide/inject](https://ru.vuejs.org/v2/api/#provide-inject).

Пример:

```js
const Component = {
  inject: ['foo'],
  template: '<div>{{this.foo()}}</div>'
}

const wrapper = shallowMount(Component, {
  provide: {
    foo() {
      return 'fooValue'
    }
  }
})

expect(wrapper.text()).toBe('fooValue')
```

## Другие опции

Если в параметрах для `mount` и `shallowMount` содержатся другие опции, отличные от опций монтирования, опции компонента будут перезаписаны с помощью [extends](https://ru.vuejs.org/v2/api/#extends).

```js
const Component = {
  template: '<div>{{ foo() }}{{ bar() }}{{ baz() }}</div>',
  methods: {
    foo() {
      return 'a'
    },
    bar() {
      return 'b'
    }
  }
}
const options = {
  methods: {
    bar() {
      return 'B'
    },
    baz() {
      return 'C'
    }
  }
}
const wrapper = mount(Component, options)
expect(wrapper.text()).toBe('aBC')
```
