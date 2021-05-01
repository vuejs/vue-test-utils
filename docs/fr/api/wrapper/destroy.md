## destroy

Détruit une instance du composant Vue.

- **Exemple:**

```js
import { mount } from '@vue/test-utils'
import sinon from 'sinon'

const spy = sinon.stub()
mount({
  render: null,
  destroyed() {
    spy()
  }
}).destroy()
expect(spy.calledOnce).toBe(true)
```

si l'option `attachTo` ou `attachToDocument` a provoqué le montage du composant sur le document, les éléments du DOM du composant seront également supprimés du document.

Pour les composants fonctionnels, `destroy` ne supprime du document que les éléments DOM rendus.
