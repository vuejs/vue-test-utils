# shallow(component,{,options}])

Create a fully rendered Vue component. Returns a wrapper that includes methods to test the component renders and reacts as expected.

### Arguments

`component` (`Component`): A vue component

### Examples

#### Without options

```js
import { shallow } from 'avoriaz'
import { expect } from 'chai'
import Foo from './Foo.vue'

describe('Foo.vue', () => {
  it('renders a div', () => {
    const wrapper = shallow(Foo)
    expect(wrapper.props(div)).to.equal(true)
  })
})
```