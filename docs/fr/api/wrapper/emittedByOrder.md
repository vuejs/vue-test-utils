## emittedByOrder

::: warning Avertissement de déprédation
Le terme `emittedByOrder` est obsolète et sera supprimé dans les prochaines versions.

Utilisez plutôt `wrapper.emitted`.
:::

Retourne un tableau contenant des événements personnalisés émis par le `Wrapper` `vm` .

- **Retours:** `Array<{ name: string, args: Array<any> }>`

- **Exemple:**

```js
import { mount } from '@vue/test-utils'

const wrapper = mount(Component)

wrapper.vm.$emit('foo')
wrapper.vm.$emit('bar', 123)

/*
wrapper.emittedByOrder() renvoie le tableau suivant :
[
  { name: 'foo', args: [] },
  { name: 'bar', args: [123] }
]
*/

// Faire valoir l'ordre d'émission d'événement
expect(wrapper.emittedByOrder().map(e => e.name)).toEqual(['foo', 'bar'])
```
