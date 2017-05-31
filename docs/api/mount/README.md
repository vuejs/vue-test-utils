# mount(component,{,options}])

Create a fully rendered Vue component. Returns a wrapper that includes methods to test the component renders and reacts as expected.

### Arguments

`component` (`Component`): A vue component

`options` (`Object`) [optional]: a Vue options object. Vue options are passed to the component when a new instance is created. , e.g. `store`, `propsData`. For full list, see the [Vue API](https://vuejs.org/v2/api/). Also takes avoriaz options:

`options.attachToDocument` (`Boolean`): Component will attach to DOM when rendered. This can be used with [`hasStyle`](/api/mount/hasStyle.md) to check multi element CSS selectors

`options.slots` (`Object`): Render component with slots.

`options.slots.default` (`Array[Component]|Component`): Default slot object to render, can be a Vue component or array of Vue components

`options.slots.name` (`Array[Component]|Component`): Named slots. i.e. slots.name will match a <slot name="name" />, can be a Vue component or array of Vue components

`options.globals` (`Object`): Add globals to Vue instance.

### Examples

#### Without options

```js
import { mount } from 'avoriaz';
import { expect } from 'chai';
import Foo from './Foo.vue';

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo);
    expect(wrapper.props(div)).to.equal(true);
  });
});
```
#### With Vue options
```js
import { mount } from 'avoriaz';
import { expect } from 'chai';]
import Foo from './Foo.vue';

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, { 
        propsData: { 
            color: 'red',
        },
    });
    expect(wrapper.props(div)).to.equal(true);
  });
});
```

#### Attach to DOM
```js
import { mount } from 'avoriaz';
import { expect } from 'chai';]
import Foo from './Foo.vue';

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, { 
        attachToDocument: true
    });
    expect(wrapper.props(div)).to.equal(true);
  });
});
```
#### Default and named slots
```js
import { mount } from 'avoriaz';
import { expect } from 'chai';]
import Foo from './Foo.vue';
import Bar from './Bar.vue';
import FooBar from './FooBar.vue';

describe('Foo', () => {
  it('renders a div', () => {
    const wrapper = mount(Foo, { 
        slots: {
            default: [Bar, FoorBar],
            fooBar: FooBar // Will match <slot name="FooBar" />
        }
    });
    expect(wrapper.props(div)).to.equal(true);
  });
});
```

#### Adding globals
```js
import { mount } from 'avoriaz';
import { expect } from 'chai';]
import Foo from './Foo.vue';

describe('Foo', () => {
  it('renders a div', () => {
    const $route = {path: 'http://www.example-path.com'};
    const wrapper = mount(Foo, { 
        globals: {
            $route
        }
    });
    expect(wrapper.vm.$route.path).to.equal($route.path);
  });
});
```
