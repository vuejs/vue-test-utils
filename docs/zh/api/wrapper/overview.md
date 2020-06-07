## overview

::: warning 废弃警告
`overview` 已经被废弃并会在未来的发布中被移除。
:::

打印一个简单的 `Wrapper` 的总览。

- **示例：**

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
