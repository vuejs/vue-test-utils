# Wrapper

vue-test-utils — это API использующее обёртки (wrapper).

`Wrapper` — это объект, который содержит примонтированный компонент или VNode и методы для тестирования компонента или VNnode.

- **Свойства:**

`vm` `Component`: это экземпляр Vue. Вы можете получить доступ ко всем [методам и свойствам экземпляра](https://ru.vuejs.org/v2/api/index.html#%D0%9E%D0%BF%D1%86%D0%B8%D0%B8-%E2%80%94-%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D0%B5) через `wrapper.vm`. Это существует только в обёртках для компонентов Vue
`element` `HTMLElement`: корневой DOM-узел обёртки
`options` `Object`: Объект содержащий опции vue-test-utils, передаваемые в `mount` или `shallow`
`options.attachedToDom` `Boolean`: `true` если был передан attachToDom в `mount` или `shallow`

- **Методы:**

Подробный список методов можно изучить в разделе документации про wrapper.
