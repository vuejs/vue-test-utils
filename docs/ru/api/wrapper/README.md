# `Wrapper`

`vue-test-utils` — это API основанное на использовании обёрток (wrapper).

`Wrapper` — это объект, который содержит примонтированный компонент или VNode и методы для тестирования компонента или VNnode.

- **Свойства:**

`vm` `Component`: это экземпляр `Vue`. Вы можете получить доступ ко всем [методам и свойствам экземпляра](https://ru.vuejs.org/v2/api/index.html#Опции-—-данные) через `wrapper.vm`. Это существует только в обёртках для компонентов Vue  
`element` `HTMLElement`: корневой DOM-узел обёртки  
`options` `Object`: Объект содержащий опции `vue-test-utils`, передаваемые в `mount` или `shallow`  
`options.attachedToDom` `Boolean`: `true` если был передан `attachToDom` в `mount` или `shallow`  

- **Методы:**

Подробный список методов можно изучить в разделе документации про wrapper.
