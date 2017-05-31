# Using with Vuex

## Mocking Actions

Let’s look at some code.

This is the component we want to test. It calls Vuex actions.

```vue
<template>
  <div class="text-align-center">
    <input type="text" @input="actionInputIfTrue" />
    <button @click="actionClick()">Click</button>
  </div>
</template>

<script>
  import { mapActions } from 'vuex';

  export default{
    methods: {
      ...mapActions([
        'actionClick',
      ]),
      actionInputIfTrue: function actionInputIfTrue(event) {
        const inputValue = event.target.value;
        if (inputValue === 'input') {
          this.$store.dispatch('actionInput', { inputValue });
        }
      },
    },
  };
</script>
```

For the purposes of this test, we don’t care what the actions do, or what the store looks like. We just need to know that these actions are being fired when they should, and that they are fired with the expected value.

To test this, we need to pass a mock store to Vue when we mount our component.

In this tutorial we will be using avoriaz, which has a mount method. We can pass the store as an option to mount.

Let’s see what this looks like:

```js
import Vue from 'vue'
import { mount } from 'avoriaz';
import sinon from 'sinon';
import { expect } from 'chai';
import Vuex from 'vuex';
import 'babel-polyfill';
import Actions from '../../../src/components/Actions';

Vue.use(Vuex);

describe('Actions.vue', () => {
  let actions;
  let store;

  beforeEach(() => {
    actions = {
      actionClick: sinon.stub(),
      actionInput: sinon.stub(),
    };
    store = new Vuex.Store({
      state: {},
      actions,
    });
  });

  it('calls store action actionInput when input value is input and an input even is fired', () => {
    const wrapper = mount(Actions, { store });
    const input = wrapper.find('input')[0];
    input.element.value = 'input';
    input.dispatch('input');
    expect(actions.actionInput.calledOnce).to.equal(true);
  });

  it('does not call store action actionInput when input value is not input and an input even is fired', () => {
    const wrapper = mount(Actions, { store });
    const input = wrapper.find('input')[0];
    input.element.value = 'not input';
    input.dispatch('input');
    expect(actions.actionInput.calledOnce).to.equal(false);
  });

  it('calls store action actionClick when button is clicked', () => {
    const wrapper = mount(Actions, { store });
    wrapper.find('button')[0].dispatch('click');
    expect(actions.actionClick.calledOnce).to.equal(true);
  });
});
```
What’s happening here? First we tell Vue to use Vuex with the Vue.use method. This is just a wrapper around Vue.use.

We then make a mock store by calling new Vuex.store with our mock values. We only pass it the actions, since that’s all we care about.

The actions are [sinon stubs](http://sinonjs.org/). The stubs give us methods to assert whether the actions were called or not.

We can then assert in our tests that the action stub was called when expected.

Now the way we define the store might look a bit foreign to you.

We’re using beforeEach to ensure we have a clean store before each test. beforeEach is a mocha hook that’s called before each test. In our test, we are reassigning the store variables value. If we didn’t do this, the sinon stubs would need to be automatically reset. It also lets us change the state in our tests, without it affecting later tests.

The most important thing to note in this test is that **we create a mock Vuex store and then pass it to avoriaz**.

Great, so now we can mock actions, let’s look at mocking getters.

## Mocking Getters
   

```vue
<template>
  <div>
    <p v-if="inputValue">{{inputValue}}</p>
    <p v-if="clicks">{{clicks}}</p>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex';

  export default{
    computed: mapGetters([
      'clicks',
      'inputValue',
    ]),
  };
</script>
```

This is a fairly simple component. It renders the result of the getters clicks and inputValue. Again, we don’t really care about what those getters returns – just that the result of them is being rendered correctly.

Let’s see the test:

```javascript
import 'babel-polyfill';
import Vue from 'vue';
import { mount } from 'avoriaz';
import { expect } from 'chai';
import Vuex from 'vuex';
import Actions from '../../../src/components/Getters';

Vue.use(Vuex);

describe('Getters.vue', () => {
  let state;
  let getters;
  let store;

  beforeEach(() => {
    getters = {
      clicks: () => 2,
      inputValue: () => 'input',
    };

    store = new Vuex.Store({
      getters,
    });
  });

  it('Renders state.inputValue in first p tag', () => {
    const wrapper = mount(Actions, { store });
    const p = wrapper.find('p')[0];
    expect(p.text()).to.equal(getters.inputValue());
  });

  it('Renders state.clicks in second p tag', () => {
    const wrapper = mount(Actions, { store });
    const p = wrapper.find('p')[1];
    expect(p.text()).to.equal(getters.clicks().toString());
  });
});
```
This test is similar to our actions test. We create a mock store before each test, pass it as an option when we call mount, and assert that the value returned by our mock getters is being rendered.

This is great, but what if we want to check our getters are returning the correct part of our state?

## Mocking with Modules
   
[Modules](https://vuex.vuejs.org/en/modules.html) are useful for separating out our store into manageable chunks. They also export getters. We can use these in our tests.

Let’s look at our component:

```vue
<template>
  <div>
    <button @click="moduleActionClick()">Click</button>
    <p>{{moduleClicks}}</p>
  </div>
</template>

<script>
  import { mapActions, mapGetters } from 'vuex';

  export default{
    methods: {
      ...mapActions([
        'moduleActionClick',
      ]),
    },

    computed: mapGetters([
      'moduleClicks',
    ]),
  };
</script>
```
Simple component that includes one action and one getter.

And the test:

```javascript
import Vue from 'vue';
import { mount } from 'avoriaz';
import sinon from 'sinon';
import { expect } from 'chai';
import Vuex from 'vuex';
import 'babel-polyfill';
import Modules from '../../../src/components/Modules';
import module from '../../../src/store/module';

Vue.use(Vuex);

describe('Modules.vue', () => {
  let actions;
  let state;
  let store;

  beforeEach(() => {
    state = {
      module: {
        clicks: 2,
      },
    };

    actions = {
      moduleActionClick: sinon.stub(),
    };

    store = new Vuex.Store({
      state,
      actions,
      getters: module.getters,
    });
  });

  it('calls store action moduleActionClick when button is clicked', () => {
    const wrapper = mount(Modules, { store });
    const button = wrapper.find('button')[0];
    button.dispatch('click');
    expect(actions.moduleActionClick.calledOnce).to.equal(true);
  });

  it('Renders state.inputValue in first p tag', () => {
    const wrapper = mount(Modules, { store });
    const p = wrapper.find('p')[0];
    expect(p.text()).to.equal(state.module.clicks.toString());
  });
});
```
To have a look at what the module file looks like, [check out the repo](https://github.com/eddyerburgh/mock-vuex-in-vue-unit-tests-tutorial).

So now we’re importing getters from out Vuex store module. This means we need to mock the state.

Is this a good thing? Well, it means we’re testing that the state we expect will be returned by the getter. But this is a unit test, so maybe we should test that in a store test.

I’ll leave it up to you whether you want to test the state or not.

Hopefully this tutorial has helped you understand how to mock Vuex in Vue unit tests.

If you have any questions, leave a comment.

