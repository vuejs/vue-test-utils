# Wrapper

O Vue Test Utils (Utilitário de Teste da Vue) é uma API baseada em envolvedor.

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

!!!include(docs/pt/api/wrapper/attributes.md)!!!
!!!include(docs/pt/api/wrapper/classes.md)!!!
!!!include(docs/pt/api/wrapper/contains.md)!!!
!!!include(docs/pt/api/wrapper/destroy.md)!!!
!!!include(docs/pt/api/wrapper/emitted.md)!!!
!!!include(docs/pt/api/wrapper/emittedByOrder.md)!!!
!!!include(docs/pt/api/wrapper/exists.md)!!!
!!!include(docs/pt/api/wrapper/find.md)!!!
!!!include(docs/pt/api/wrapper/findAll.md)!!!
!!!include(docs/pt/api/wrapper/findComponent.md)!!!
!!!include(docs/pt/api/wrapper/findAllComponents.md)!!!
!!!include(docs/pt/api/wrapper/html.md)!!!
!!!include(docs/pt/api/wrapper/get.md)!!!
!!!include(docs/pt/api/wrapper/is.md)!!!
!!!include(docs/pt/api/wrapper/isEmpty.md)!!!
!!!include(docs/pt/api/wrapper/isVisible.md)!!!
!!!include(docs/pt/api/wrapper/isVueInstance.md)!!!
!!!include(docs/pt/api/wrapper/name.md)!!!
!!!include(docs/pt/api/wrapper/props.md)!!!
!!!include(docs/pt/api/wrapper/setChecked.md)!!!
!!!include(docs/pt/api/wrapper/setData.md)!!!
!!!include(docs/pt/api/wrapper/setMethods.md)!!!
!!!include(docs/pt/api/wrapper/setProps.md)!!!
!!!include(docs/pt/api/wrapper/setSelected.md)!!!
!!!include(docs/pt/api/wrapper/setValue.md)!!!
!!!include(docs/pt/api/wrapper/text.md)!!!
!!!include(docs/pt/api/wrapper/trigger.md)!!!
