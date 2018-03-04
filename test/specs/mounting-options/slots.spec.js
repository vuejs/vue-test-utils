// import { compileToFunctions } from 'vue-template-compiler'
// import Component from '~resources/components/component.vue'
// import ComponentWithSlots from '~resources/components/component-with-slots.vue'
// import ComponentAsAClass from '~resources/components/component-as-a-class.vue'
// import {
//   describeWithMountingMethods,
//   vueVersion,
//   itSkipIf,
//   VUE_TEST_UTILS_PATH
// } from '~resources/utils'
//
// describeWithMountingMethods('options.slots', (mountingMethod) => {
//   let _window
//
//   beforeEach(() => {
//     _window = window
//   })
//
//   afterEach(() => {
//     if (!window.navigator.userAgent.match(/Chrome/i)) {
//       window = _window // eslint-disable-line no-native-reassign
//     }
//   })
//
//   it('mounts component with default slot if passed component in slot object', () => {
//     const wrapper = mountingMethod(ComponentWithSlots, { slots: { default: Component }})
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('<div></div>')
//     } else {
//       expect(wrapper.contains(Component)).to.equal(true)
//     }
//   })
//
//   it('mounts component with default slot if passed component in array in slot object', () => {
//     const wrapper = mountingMethod(ComponentWithSlots, { slots: { default: [Component] }})
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('<div></div>')
//     } else {
//       expect(wrapper.contains(Component)).to.equal(true)
//     }
//   })
//
//   it('mounts component with default slot if passed object with template prop in slot object', () => {
//     const compiled = compileToFunctions('<div id="div" />')
//     const wrapper = mountingMethod(ComponentWithSlots, { slots: { default: [compiled] }})
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('div id="div"')
//     } else {
//       expect(wrapper.contains('#div')).to.equal(true)
//     }
//   })
//
//   it('mounts component with default slot if passed string in slot object', () => {
//     const wrapper = mountingMethod(ComponentWithSlots, { slots: { default: '<span />' }})
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('<span')
//     } else {
//       expect(wrapper.contains('span')).to.equal(true)
//     }
//   })
//
//   it('works correctly with class component', () => {
//     if (vueVersion < 2.3) {
//       return
//     }
//     const wrapper = mountingMethod(ComponentAsAClass, { slots: { default: '<span />' }})
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('<span')
//     } else {
//       expect(wrapper.contains('span')).to.equal(true)
//     }
//   })
//
//   it('throws error if the UserAgent is PhantomJS when passed string is in slot object', () => {
//     if (window.navigator.userAgent.match(/Chrome/i)) {
//       return
//     }
//     window = { navigator: { userAgent: 'PhantomJS' }} // eslint-disable-line no-native-reassign
//     const message = '[vue-test-utils]: option.slots does not support strings in PhantomJS. Please use Puppeteer, or pass a component'
//     const fn = () => mountingMethod(ComponentWithSlots, { slots: { default: 'foo' }})
//     expect(fn).to.throw().with.property('message', message)
//   })
//
//   it('mounts component with default slot if passed string in slot object', () => {
//     if (mountingMethod.name === 'renderToString') {
//       return
//     }
//     const wrapper1 = mountingMethod(ComponentWithSlots, { slots: { default: 'foo<span>123</span>{{ foo }}' }})
//     expect(wrapper1.find('main').html()).to.equal('<main>foo<span>123</span>bar</main>')
//     const wrapper2 = mountingMethod(ComponentWithSlots, { slots: { default: '<p>1</p>{{ foo }}2' }})
//     expect(wrapper2.find('main').html()).to.equal('<main><p>1</p>bar2</main>')
//     const wrapper3 = mountingMethod(ComponentWithSlots, { slots: { default: '<p>1</p>{{ foo }}<p>2</p>' }})
//     expect(wrapper3.find('main').html()).to.equal('<main><p>1</p>bar<p>2</p></main>')
//     const wrapper4 = mountingMethod(ComponentWithSlots, { slots: { default: '123' }})
//     expect(wrapper4.find('main').html()).to.equal('<main>123</main>')
//     const wrapper5 = mountingMethod(ComponentWithSlots, { slots: { default: '1{{ foo }}2' }})
//     expect(wrapper5.find('main').html()).to.equal('<main>1bar2</main>')
//     wrapper5.trigger('keydown')
//     expect(wrapper5.find('main').html()).to.equal('<main>1BAR2</main>')
//     const wrapper6 = mountingMethod(ComponentWithSlots, { slots: { default: '<p>1</p><p>2</p>' }})
//     expect(wrapper6.find('main').html()).to.equal('<main><p>1</p><p>2</p></main>')
//     const wrapper7 = mountingMethod(ComponentWithSlots, { slots: { default: '1<p>2</p>3' }})
//     expect(wrapper7.find('main').html()).to.equal('<main>1<p>2</p>3</main>')
//   })
//
//   itSkipIf(mountingMethod.name === 'renderToString',
//     'throws error if passed string in default slot object and vue-template-compiler is undefined', () => {
//     const compilerSave = require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions
//     require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = undefined
//     delete require.cache[require.resolve(VUE_TEST_UTILS_PATH)]
//     const mountingMethodFresh = require(VUE_TEST_UTILS_PATH)[mountingMethod.name]
//     const message = '[vue-test-utils]: vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined'
//     const fn = () => mountingMethodFresh(ComponentWithSlots, { slots: { default: '<span />' }})
//     try {
//       expect(fn).to.throw().with.property('message', message)
//     } catch (err) {
//       require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = compilerSave
//       throw err
//     }
//     require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = compilerSave
//   })
//
//   it('mounts component with default slot if passed string in slot array object', () => {
//     const wrapper = mountingMethod(ComponentWithSlots, { slots: { default: ['<span />'] }})
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('<span')
//     } else {
//       expect(wrapper.contains('span')).to.equal(true)
//     }
//   })
//
//   it('mounts component with default slot if passed string in slot text array object', () => {
//     const wrapper = mountingMethod(ComponentWithSlots, { slots: { default: ['{{ foo }}<span>1</span>', 'bar'] }})
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('<main>bar<span>1</span>bar</main>')
//     } else {
//       expect(wrapper.find('main').html()).to.equal('<main>bar<span>1</span>bar</main>')
//     }
//   })
//
//   itSkipIf(mountingMethod.name === 'renderToString',
//   'throws error if passed string in default slot array vue-template-compiler is undefined', () => {
//     const compilerSave = require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions
//     require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = undefined
//     delete require.cache[require.resolve(VUE_TEST_UTILS_PATH)]
//     const mountingMethodFresh = require(VUE_TEST_UTILS_PATH)[mountingMethod.name]
//     const message = '[vue-test-utils]: vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined'
//     const fn = () => mountingMethodFresh(ComponentWithSlots, { slots: { default: ['<span />'] }})
//     try {
//       expect(fn).to.throw().with.property('message', message)
//     } catch (err) {
//       require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = compilerSave
//       throw err
//     }
//     require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = compilerSave
//   })
//
//   it('mounts component with named slot if passed component in slot object', () => {
//     const wrapper = mountingMethod(ComponentWithSlots, {
//       slots: {
//         header: [Component],
//         footer: [Component]
//       }
//     })
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('<header><div></div></header> <main></main> <footer><div></div></footer>')
//     } else {
//       expect(wrapper.findAll(Component).length).to.equal(2)
//     }
//   })
//
//   it('mounts component with named slot if passed component in slot object', () => {
//     const wrapper = mountingMethod(ComponentWithSlots, {
//       slots: {
//         header: Component
//       }
//     })
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('<header><div></div></header>')
//     } else {
//       expect(wrapper.findAll(Component).length).to.equal(1)
//       expect(Array.isArray(wrapper.vm.$slots.header)).to.equal(true)
//     }
//   })
//
//   it('mounts functional component with default slot if passed component in slot object', () => {
//     const TestComponent = {
//       name: 'component-with-slots',
//       functional: true,
//       render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
//     }
//     const wrapper = mountingMethod(TestComponent, { slots: { default: Component }})
//     if (mountingMethod.name === 'renderToString') {
//       const renderedAttribute = vueVersion < 2.3 ? 'server-rendered' : 'data-server-rendered'
//       expect(wrapper).contains(`<div ${renderedAttribute}="true"><div></div></div>`)
//     } else {
//       expect(wrapper.contains(Component)).to.equal(true)
//     }
//   })
//
//   it('mounts component with default slot if passed component in slot object', () => {
//     const TestComponent = {
//       name: 'component-with-slots',
//       functional: true,
//       render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
//     }
//     const wrapper = mountingMethod(TestComponent, { slots: { default: [Component] }})
//     if (mountingMethod.name === 'renderToString') {
//       const renderedAttribute = vueVersion < 2.3 ? 'server-rendered' : 'data-server-rendered'
//       expect(wrapper).contains(`<div ${renderedAttribute}="true"><div></div></div>`)
//     } else {
//       expect(wrapper.contains(Component)).to.equal(true)
//     }
//   })
//
//   it('mounts component with default slot if passed object with template prop in slot object', () => {
//     const TestComponent = {
//       name: 'component-with-slots',
//       functional: true,
//       render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
//     }
//     const compiled = compileToFunctions('<div id="div" />')
//     const wrapper = mountingMethod(TestComponent, { slots: { default: [compiled] }})
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('<div id="div">')
//     } else {
//       expect(wrapper.contains('#div')).to.equal(true)
//     }
//   })
//
//   it('mounts component with default slot if passed string in slot object', () => {
//     const TestComponent = {
//       name: 'component-with-slots',
//       functional: true,
//       render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
//     }
//     const wrapper = mountingMethod(TestComponent, { slots: { default: '<span />' }})
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('<span')
//     } else {
//       expect(wrapper.contains('span')).to.equal(true)
//     }
//   })
//
//   it('mounts component with named slot if passed string in slot object', () => {
//     const TestComponent = {
//       functional: true,
//       render: (h, ctx) => h('div', {}, ctx.slots().named)
//     }
//     const wrapper = mountingMethod(TestComponent, { slots: { named: Component }})
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('<div></div>')
//     } else {
//       expect(wrapper.contains(Component)).to.equal(true)
//     }
//   })
//
//   it('mounts component with named slot if passed string in slot object in array', () => {
//     const TestComponent = {
//       functional: true,
//       render: (h, ctx) => h('div', {}, ctx.slots().named)
//     }
//     const wrapper = mountingMethod(TestComponent, { slots: { named: [Component] }})
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('<div></div>')
//     } else {
//       expect(wrapper.contains(Component)).to.equal(true)
//     }
//   })
//
//   it('mounts component with named slot if passed string in slot object in array', () => {
//     const TestComponent = {
//       functional: true,
//       render: (h, ctx) => h('div', {}, ctx.slots().named)
//     }
//     const wrapper = mountingMethod(TestComponent, { slots: { named: '<span />' }})
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('<span')
//     } else {
//       expect(wrapper.contains('span')).to.equal(true)
//     }
//   })
//
//   it('mounts component with named slot if passed string in slot object in array', () => {
//     const TestComponent = {
//       functional: true,
//       render: (h, ctx) => h('div', {}, ctx.slots().named)
//     }
//     const wrapper = mountingMethod(TestComponent, { slots: { named: ['<span />'] }})
//     if (mountingMethod.name === 'renderToString') {
//       expect(wrapper).contains('<span')
//     } else {
//       expect(wrapper.contains('span')).to.equal(true)
//     }
//   })
//
//   it('throws error if passed false for named slots', () => {
//     const TestComponent = {
//       name: 'component-with-slots',
//       functional: true,
//       render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
//     }
//     const fn = () => mountingMethod(TestComponent, { slots: { named: [false] }})
//     const message = '[vue-test-utils]: slots[key] must be a Component, string or an array of Components'
//     expect(fn).to.throw().with.property('message', message)
//   })
//
//   it('throws error if passed a number for named slots', () => {
//     const TestComponent = {
//       name: 'component-with-slots',
//       functional: true,
//       render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
//     }
//     const fn = () => mountingMethod(TestComponent, { slots: { named: [1] }})
//     const message = '[vue-test-utils]: slots[key] must be a Component, string or an array of Components'
//     expect(fn).to.throw().with.property('message', message)
//   })
//
//   it('throws error if passed false for named slots', () => {
//     const TestComponent = {
//       name: 'component-with-slots',
//       functional: true,
//       render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
//     }
//     const fn = () => mountingMethod(TestComponent, { slots: { named: false }})
//     const message = '[vue-test-utils]: slots[key] must be a Component, string or an array of Components'
//     expect(fn).to.throw().with.property('message', message)
//   })
//
//   it('throws error if passed a number for named slots', () => {
//     const TestComponent = {
//       name: 'component-with-slots',
//       functional: true,
//       render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
//     }
//     const fn = () => mountingMethod(TestComponent, { slots: { named: 1 }})
//     const message = '[vue-test-utils]: slots[key] must be a Component, string or an array of Components'
//     expect(fn).to.throw().with.property('message', message)
//   })
//
//   itSkipIf(mountingMethod.name === 'renderToString',
//   'throws error if passed string in default slot array when vue-template-compiler is undefined', () => {
//     const TestComponent = {
//       name: 'component-with-slots',
//       functional: true,
//       render: (h, ctx) => h('div', ctx.data, ctx.slots().default)
//     }
//     const compilerSave = require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions
//     require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = undefined
//     delete require.cache[require.resolve(VUE_TEST_UTILS_PATH)]
//     const mountingMethodFresh = require(VUE_TEST_UTILS_PATH)[mountingMethod.name]
//     const message = '[vue-test-utils]: vueTemplateCompiler is undefined, you must pass components explicitly if vue-template-compiler is undefined'
//     const fn = () => mountingMethodFresh(TestComponent, { slots: { default: ['<span />'] }})
//     try {
//       expect(fn).to.throw().with.property('message', message)
//     } catch (err) {
//       require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = compilerSave
//       throw err
//     }
//     require.cache[require.resolve('vue-template-compiler')].exports.compileToFunctions = compilerSave
//   })
// })
