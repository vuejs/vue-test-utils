## destroy

Destroys a Vue component instance.

- **Example:**

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

if `attachToDocument` was set to `true` when mounted, the component DOM elements will
also be removed from the document.

For functional components, `destroy` only removes the rendered DOM elements from the document.
