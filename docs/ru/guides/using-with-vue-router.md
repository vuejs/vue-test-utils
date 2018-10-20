## Использование с Vue Router

### Установка Vue Router в тестах

Вы никогда не должны устанавливать Vue Router в базовый конструктор Vue в тестах. Установка Vue Router добавляет `$route` и `$router` как свойства только для чтения на прототипе Vue.

Чтобы этого избежать, мы можем создать localVue и установить Vue Router на него.

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)
const router = new VueRouter()

shallowMount(Component, {
  localVue,
  router
})
```

> **Примечание:** Установка Vue Router на `localVue` также добавляет `$route` и `$router` в качестве свойство только для чтения `localVue`. Это означает, что вы можете использовать опцию `mocks` для перезаписи `$route` и `$router` при монтировании компонента, используя `localVue` с установленным Vue Router.

### Тестирование компонентов использующих `router-link` или `router-view`

Когда вы устанавливаете Vue Router, регистрируются глобальные компоненты `router-link` и `router-view`. Это означает, что мы можем использовать их в любом месте нашего приложения без необходимости импортировать их.

Когда мы запускаем тесты, нам нужно сделать эти компоненты vue-router доступными для компонента, который мы монтируем. Есть два способа сделать это.

#### Использование заглушек (stubs)

```js
import { shallowMount } from '@vue/test-utils'

shallowMount(Component, {
  stubs: ['router-link', 'router-view']
})
```

#### Установка Vue Router с помощью localVue

```js
import { shallowMount, createLocalVue } from '@vue/test-utils'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(VueRouter)

shallowMount(Component, {
  localVue
})
```

### Создание моков `$route` и `$router`

Иногда вам может потребоваться протестировать, что компонент что-то делает с параметрами объектов `$route` и `$router`. Для этого вы можете передавать пользовательские моки в экземпляр Vue.

```js
import { shallowMount } from '@vue/test-utils'

const $route = {
  path: '/some/path'
}

const wrapper = shallowMount(Component, {
  mocks: {
    $route
  }
})

wrapper.vm.$route.path // /some/path
```

### Известные подводные камни

Установка Vue Router добавляет `$route` и `$router` в качестве свойств только для чтения на прототипе Vue.

Это означает, что любые будущие тесты, которые попытаются сделать мок `$route` или `$router` потерпят неудачу.

Для избежания этого никогда не устанавливайте Vue Router глобально при запуске тестов; используйте localVue как было показано выше.
