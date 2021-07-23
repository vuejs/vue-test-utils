## trigger

Déclenche un événement de manière asynchrone sur le nœud DOM de l'`Wrapper`.

Le `trigger` prend un objet `options` optionnel. Les propriétés de l'objet `options` sont ajoutées à l'événement.
Le `trigger` renvoie une Promesse, qui une fois résolue, garantit la mise à jour du composant.
Le `trigger` ne fonctionne qu'avec les événements DOM natifs. Pour émettre un événement personnalisé, utilisez `wrapper.vm.$emit('myCustomEvent')`

- **Arguments:**

  - `{string} eventType` **requis**
  - `{Object} options` **facultatif**

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'
import Foo from './Foo'

test('trigger demo', async () => {
  const clickHandler = sinon.stub()
  const wrapper = mount(Foo, {
    propsData: { clickHandler }
  })

  await wrapper.trigger('click')

  await wrapper.trigger('click', {
    button: 0
  })

  await wrapper.trigger('click', {
    ctrlKey: true // For testing @click.ctrl handlers
  })

  expect(clickHandler.called).toBe(true)
})
```

- **Définir l'objectif de l'événement :**

Sous le capot, `trigger` cré un objet `Event` et envoie l'événement sur l'élément Wrapper.

Il n'est pas possible de modifier la valeur `target` d'un objet `Event`, donc vous pouvez pas définir la `target` dans l'objet options.

Pour ajouter un attribut à la `target`, vous devez définir la valeur de l'élément Wrapper avant d’appeler le `trigger`. Vous pouvez le faire avec la propriété `element`.

```js
const input = wrapper.find('input')
input.element.value = 100
input.trigger('click')
```
