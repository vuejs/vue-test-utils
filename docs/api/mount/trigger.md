# trigger(eventName)

trigger an event on the wrapper

### Arguments

event (`String`): type of event (e.g. click).

## Example

```js
import { mount } from 'avoriaz';
import sinon from 'sinon';
import Foo from './Foo';

const clickHandler = sinon.stub();
const wrapper = mount(Foo, {
  propsData: { clickHandler },
});

wrapper.trigger('click');

expect(clickHandler.called).to.equal(true)
```
