# Wrapper (Envolvedor)

O Vue Test Utils (Utilitário de Teste do Vue) é uma API baseada em envolvedor.

Um `Wrapper` (envolvedor) é um objeto que contém um componente montado ou vnode (nó do vue) ou métodos para testar o componente ou vnode (nó do vue).

<div class="vueschool"><a href="https://vueschool.io/lessons/the-wrapper-object?friend=vuejs" target="_blank" rel="sponsored noopener" title="Aprenda sobre o objeto Wrapper em um vídeo aula gratuita da Vue School">Aprenda sobre o objeto Wrapper em um vídeo aula gratuita da Vue School</a></div>

## Propriedades

### `vm`

`Component` (somente-leitura): Isto é a instância de `Vue`. Você pode acessar todos os [métodos da instância e propriedades de um vm (modelo de vue)](https://vuejs.org/v2/api/#Instance-Properties) com o `wrapper.vm`. Isto só existe no envolvedor do componente de Vue ou no HTMLElement ligando o envolvedor do componente de Vue.

### `element`

`HTMLElement` (somente-leitura): o nó raiz do DOM de um envolvedor

### `options`

#### `options.attachedToDocument`

`Boolean` (read-only): `true` se o componente estiver [ligado ao documento](../options.md) quando renderizado.

### `selector`

`Selector`: o seletor que foi usado pelo [`find()`](./find.md) ou pelo [`findAll()`](./findAll.md) para criar este envolvedor

## Métodos

!!!include(docs/api/wrapper/attributes.md)!!!
!!!include(docs/api/wrapper/classes.md)!!!
!!!include(docs/api/wrapper/contains.md)!!!
!!!include(docs/api/wrapper/destroy.md)!!!
!!!include(docs/api/wrapper/emitted.md)!!!
!!!include(docs/api/wrapper/emittedByOrder.md)!!!
!!!include(docs/api/wrapper/exists.md)!!!
!!!include(docs/api/wrapper/find.md)!!!
!!!include(docs/api/wrapper/findAll.md)!!!
!!!include(docs/api/wrapper/findComponent.md)!!!
!!!include(docs/api/wrapper/findAllComponents.md)!!!
!!!include(docs/api/wrapper/html.md)!!!
!!!include(docs/api/wrapper/get.md)!!!
!!!include(docs/api/wrapper/is.md)!!!
!!!include(docs/api/wrapper/isEmpty.md)!!!
!!!include(docs/api/wrapper/isVisible.md)!!!
!!!include(docs/api/wrapper/isVueInstance.md)!!!
!!!include(docs/api/wrapper/name.md)!!!
!!!include(docs/api/wrapper/props.md)!!!
!!!include(docs/api/wrapper/setChecked.md)!!!
!!!include(docs/api/wrapper/setData.md)!!!
!!!include(docs/api/wrapper/setMethods.md)!!!
!!!include(docs/api/wrapper/setProps.md)!!!
!!!include(docs/api/wrapper/setSelected.md)!!!
!!!include(docs/api/wrapper/setValue.md)!!!
!!!include(docs/api/wrapper/text.md)!!!
!!!include(docs/api/wrapper/trigger.md)!!!
