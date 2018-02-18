# Использование с Vue Router

## Установка Vue Router в тестах

Вы никогда не должны устанавливать Vue Router в базовый конструктор Vue в тестах. Установка Vue Router добавляет `$route` и `$router` как свойства только для чтения на прототипе Vue.

Чтобы этого избежать, мы можем создать localVue и установить Vue Router на него.

```js
import { shallow, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter()

shallow(Component, {
  localVue,
  router
})
```

## Тестирование компонентов использующих `router-link` или `router-view`

Когда вы устанавливаете Vue Router, регистрируются глобальные компоненты `router-link` и `router-view`. Это означает, что мы можем использовать их в любом месте нашего приложения без необходимости импортировать их.

Когда мы запускаем тесты, нам нужно сделать эти компоненты vue-router доступными для компонента, который мы монтируем. Есть два способа сделать это.

### Использование заглушек (stubs)

```js
import { shallow } from '@vue/test-utils'

shallow(Component, {
  stubs: ['router-link', 'router-view']
})
```

### Установка Vue Router с помощью localVue

```js
import { shallow, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)

shallow(Component, {
  localVue
})
```

## Создание моков `$route` и `$router`

Иногда вам может потребоваться протестировать, что компонент что-то делает с параметрами объектов `$route` и `$router`. Для этого вы можете передавать пользовательские моки в экземпляр Vue.

```js
import { shallow } from '@vue/test-utils'

const $route = {
  path: '/some/path'
}

const wrapper = shallow(Component, {
  mocks: {
    $route
  }
})

wrapper.vm.$route.path // /some/path
```

## Общие ошибки

Установка Vue Router добавляет `$route` и `$router` в качестве свойств только для чтения на прототипе Vue.

Это означет, что любые будущие тесты, которые попытаются сделать мок `$route` или `$router` потерпят неудачу.

Для избежания этого никогда не устанавливайте Vue Router глобально при запуске тестов; используйте localVue как было показано выше.
