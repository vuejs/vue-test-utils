import { compileToFunctions } from 'vue-template-compiler'
import mount from '../../../src/mount'

describe('mount', () => {
  it('returns new VueWrapper with mounted Vue instance if no options are passed', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('node.js')) {
      return
    }
    const compiled = compileToFunctions('<div><input /></div>')
    const wrapper = mount(compiled)
    expect(wrapper.vm).to.be.an('object')
  })
})
/*
it('returns new VueWrapper with mounted Vue instance with props, if passed as propsData', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('node.js')) {
    return;
}
const childClickHandler = () => {};
const wrapper = mount(ClickComponent, { propsData: { childClickHandler } });
expect(wrapper.element.querySelector('button')).to.be.instanceOf(HTMLElement);
expect(wrapper.vm).to.be.an('object');
expect(wrapper.vm.$props.childClickHandler).to.equal(childClickHandler);
});

it('mounts component to DOM before returning VueWrapper when passed attachToDocument in options', () => {
    if (navigator.userAgent.includes && navigator.userAgent.includes('node.js')) {
    return;
}
const compiled = compileToFunctions('<div><input /></div>');
const wrapper = mount(compiled, { attachToDocument: true });
expect(wrapper.element.querySelector('input')).to.be.instanceOf(HTMLElement);
expect(wrapper.vm).to.be.an('object');
expect(document.querySelectorAll('input').length).to.equal(1);
});

it('mounts component with default slot if passed component in slot object', () => {
    const wrapper = mount(SlotChild, { slots: { default: [ClickComponent] } });
expect(wrapper.contains(ClickComponent)).to.equal(true);
});

it('mounts component with default slot if passed object with template prop in slot object', () => {
    const compiled = compileToFunctions('<div id="div" />');
const wrapper = mount(SlotChild, { slots: { default: [compiled] } });
expect(wrapper.contains('#div')).to.equal(true);
});

it('mounts component with named slot if passed component in slot object', () => {
    const wrapper = mount(SlotChild, {
        slots: {
            header: [ClickComponent],
            footer: [ClickComponent],
        },
    });
expect(wrapper.find(ClickComponent).length).to.equal(2);
});

it('mounts component with named slot if passed component in slot object', () => {
    const wrapper = mount(SlotChild, {
        slots: {
            header: ClickComponent,
        },
    });
expect(wrapper.find(ClickComponent).length).to.equal(1);
expect(Array.isArray(wrapper.vm.$slots.header)).to.equal(true);
});

it('returns VueWrapper with mountedToDom set to true when passed attachToDocument in options', () => {
    const compiled = compileToFunctions('<div><input /></div>');
const wrapper = mount(compiled, { attachToDocument: true });
expect(wrapper.mountedToDom).to.equal(true);
});

it('throws error if slots[key] is not an array or object', () => {
    const message = 'slots[key] must be a Component or an array of Components';
expect(() => mount(SlotChild, {
    slots: {
        header: 'ClickComponent',
        footer: [ClickComponent],
    },
})).to.throw(Error, message);
});

it('injects global variables when passed as inject object', () => {
    const $store = { store: true };
const $route = { path: 'http://avoriaz.com' };
const wrapper = mount(SlotChild, {
    globals: {
        $store,
        $route,
    },
});
expect(wrapper.vm.$store).to.equal($store);
expect(wrapper.vm.$route).to.equal($route);
});

it('does not use cached component', () => {
    MixinComponent.methods.someMethod = sinon.stub();
mount(MixinComponent);
expect(MixinComponent.methods.someMethod.callCount).to.equal(1);
MixinComponent.methods.someMethod = sinon.stub();
mount(MixinComponent);
expect(MixinComponent.methods.someMethod.callCount).to.equal(1);
});
});*/
