## overview

Prints a simple overview of the `Wrapper`.

- **Example:**

```js
import { mount } from '@vue/test-utils'
import Component from './Component.vue'

const wrapper = mount(Component)
wrapper.overview()

// Console output
/*
Wrapper (Visible):

Html:
    <div class="test">
      <p>My name is Tess Ting</p>
    </div>

Data: {
    firstName: Tess,
    lastName: Ting
}

Computed: {
    fullName: Tess Ting'
}

Emitted: {',
    foo: [',
        0: [ hello, world ],
        1: [ bye, world ]'
    ],
    bar: [
        0: [ hey ]'
    ]
}

*/
```
