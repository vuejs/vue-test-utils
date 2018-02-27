# TransitionGroupStub

`transition-group`은 래퍼 컴포넌트를 스텁하는 컴포넌트입니다. 트랜지션을 비동기로 수행하는 대신, 동기적으로 자식 컴포넌트를 반환합니다.

이것은 vue-test-utils에서 기본 config에서 모든 `transition-group` 컴포넌트를 스텁하도록 설정되어 있습니다. 내장된 `transition-group` 래퍼 컴포넌트를 기본으로 쓰고싶다면, `config.stubs[transition-group]`을 false로 설정합시다.:


```js
import VueTestUtils from '@vue/test-utils'

VueTestUtils.config.stubs.transition = false
```

트랜지션 컴포넌트를 스텁으로 재설정하려면 다음을 하십시오.

```js
import VueTestUtils, { TransitionGroupStub } from '@vue/test-utils'

VueTestUtils.config.stubs['transition-group'] = TransitionGroupStub
```

마운트 옵션에서 스텁으로 설정하려면 다음을 하십시오.

```js
import { mount, TransitionGroupStub } from '@vue/test-utils'

mount(Component, {
  stubs: {
    'transition-group': TransitionGroupStub
  }
})
```
