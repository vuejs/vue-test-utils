# Wrapper

Vue Test Utils — это API основанное на использовании обёрток (wrapper).

`Wrapper` — это объект, который содержит примонтированный компонент или VNode и методы для тестирования компонента или VNnode.

## Свойства

### `vm`

`Component` (только для чтения): Это экземпляр `Vue`. Вы можете получить доступ ко всем [методам и свойствам экземпляра](https://ru.vuejs.org/v2/api/index.html#Опции-—-данные) через `wrapper.vm`. Это существует только в обёртке компонента Vue или обёртке компонента Vue, связанной с HTMLElement.

### `element`

`HTMLElement` (только для чтения): Корневой DOM-узел обёртки

### `options`

#### `options.attachedToDocument`

`Boolean` (только для чтения): true, если компонент прикреплен к DOM при монтировании.

## Методы

!!!include(docs/ru/api/wrapper/attributes.md)!!!
!!!include(docs/ru/api/wrapper/classes.md)!!!
!!!include(docs/ru/api/wrapper/contains.md)!!!
!!!include(docs/ru/api/wrapper/destroy.md)!!!
!!!include(docs/ru/api/wrapper/emitted.md)!!!
!!!include(docs/ru/api/wrapper/emittedByOrder.md)!!!
!!!include(docs/ru/api/wrapper/exists.md)!!!
!!!include(docs/ru/api/wrapper/find.md)!!!
!!!include(docs/ru/api/wrapper/findAll.md)!!!
!!!include(docs/ru/api/wrapper/html.md)!!!
!!!include(docs/ru/api/wrapper/is.md)!!!
!!!include(docs/ru/api/wrapper/isEmpty.md)!!!
!!!include(docs/ru/api/wrapper/isVisible.md)!!!
!!!include(docs/ru/api/wrapper/isVueInstance.md)!!!
!!!include(docs/ru/api/wrapper/name.md)!!!
!!!include(docs/ru/api/wrapper/props.md)!!!
!!!include(docs/ru/api/wrapper/setChecked.md)!!!
!!!include(docs/ru/api/wrapper/setData.md)!!!
!!!include(docs/ru/api/wrapper/setMethods.md)!!!
!!!include(docs/ru/api/wrapper/setProps.md)!!!
!!!include(docs/ru/api/wrapper/setSelected.md)!!!
!!!include(docs/ru/api/wrapper/setValue.md)!!!
!!!include(docs/ru/api/wrapper/text.md)!!!
!!!include(docs/ru/api/wrapper/trigger.md)!!!
