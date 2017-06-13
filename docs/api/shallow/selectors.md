# Shallow Selectors

A lot of methods take a selector as an argument. 

shallow handles a limited range of CSS selectors:

- tag selectors (div, foo, bar)
- class selectors (.foo, .bar)
- id selectors (#foo, #bar)

### Example

```js
import Foo from './Foo.vue';
const wrapper = shallow(Foo);

expect(wrapper.findAll('div').length).to.equal(3);
```
