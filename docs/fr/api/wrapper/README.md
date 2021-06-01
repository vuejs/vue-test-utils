# Wrapper

Vue Test Utils est une API basée sur un wrapper

Un `wrapper` est un objet qui contient un composant ou vnode monté et des méthodes pour tester le composant ou vnode

<div class="vueschool"><a href="https://vueschool.io/lessons/the-wrapper-object?friend=vuejs" target="_blank" rel="sponsored noopener" title="Learn about the Wrapper object in a FREE video lesson from Vue School">Découvrez l'objet Wrapper dans une leçon vidéo GRATUITE de Vue School</a></div>

## Propriétés

### `vm`

`Component`(lecture seule): c'est l'instance `Vue`. Vous pouvez accéder à toutes les [méthodes et propriétés de l'instance d'un vm](https://vuejs.org/v2/api/#Instance-Properties) avec un `wrapper.vm`. Ceci n'existe que pour le wrapper du composant Vue ou le wrapper du composant Vue liant les éléments HTMLE.

### `element`

`HTMLElement` (lecture seule): le nœud DOM racine du wrapper

### `options`

#### `options.attachedToDocument`

`Boolean` (lecture seule): `true` si le composant est [joint au document](../options.md) lorsqu'il est rendu

### `selector`

`Selector`: le sélecteur qui a été utilisé par [`find()`](./find.md) ou [`findAll()`](./findAll.md) pour créer cette enveloppe.

## Méthodes

!!!inclus(docs/fr/api/wrapper/attributes.md)!!!
!!!inclus(docs/fr/api/wrapper/classes.md)!!!
!!!inclus(docs/fr/api/wrapper/contains.md)!!!
!!!inclus(docs/fr/api/wrapper/destroy.md)!!!
!!!inclus(docs/fr/api/wrapper/emitted.md)!!!
!!!inclus(docs/fr/api/wrapper/emittedByOrder.md)!!!
!!!inclus(docs/fr/api/wrapper/exists.md)!!!
!!!inclus(docs/fr/api/wrapper/find.md)!!!
!!!inclus(docs/fr/api/wrapper/findAll.md)!!!
!!!inclus(docs/fr/api/wrapper/findComponent.md)!!!
!!!inclus(docs/fr/api/wrapper/findAllComponents.md)!!!
!!!inclus(docs/fr/api/wrapper/html.md)!!!
!!!inclus(docs/fr/api/wrapper/get.md)!!!
!!!inclus(docs/fr/api/wrapper/is.md)!!!
!!!inclus(docs/fr/api/wrapper/isEmpty.md)!!!
!!!inclus(docs/fr/api/wrapper/isVisible.md)!!!
!!!inclus(docs/fr/api/wrapper/isVueInstance.md)!!!
!!!inclus(docs/fr/api/wrapper/name.md)!!!
!!!inclus(docs/fr/api/wrapper/props.md)!!!
!!!inclus(docs/fr/api/wrapper/setChecked.md)!!!
!!!inclus(docs/fr/api/wrapper/setData.md)!!!
!!!inclus(docs/fr/api/wrapper/setMethods.md)!!!
!!!inclus(docs/fr/api/wrapper/setProps.md)!!!
!!!inclus(docs/fr/api/wrapper/setSelected.md)!!!
!!!inclus(docs/fr/api/wrapper/setValue.md)!!!
!!!inclus(docs/fr/api/wrapper/text.md)!!!
!!!inclus(docs/fr/api/wrapper/trigger.md)!!!
