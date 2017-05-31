# Getting Started

```
npm install --save-dev avoriaz
```

Then import into your test file and use it with your favorite runner.

```
import { mount } from 'avoriaz';
impot Foo from './Foo.vue';

const wrapper = mount(Foo);

expect(Foo.text()).to.equal('foo');
```

## Examples

- [Example using karma and mocha](https://github.com/eddyerburgh/avoriaz-karma-mocha-example)
- [Example using mocha-webpack](https://github.com/eddyerburgh/avoriaz-mocha-example)


```js
import { mount } from 'avoriaz';
import { expect } from 'chai';
import Foo from './Foo.vue';
import Bar from './Bar.vue';

const wrapper = mount(Foo);
const bar = wrapper.find(Bar);

describe('Foo.vue', () => {
	it('renders Bar', () => {
		const wrapper = mount(Foo);
		
    const bar = wrapper.find(Bar);
    expect(bar.isVueComponent).to.equal(true);
	});
	
	it('toggles class name on click', () => {
    const wrapper = mount(Foo);
   	expect(wrapper.hasClass('active')).to.equal(false);
   	wrapper.dispatch('click');
    expect(wrapper.hasClass('active')).to.equal(true);
    wrapper.dispatch('click');
    expect(wrapper.hasClass('active')).to.equal(false);
  });
});
```
