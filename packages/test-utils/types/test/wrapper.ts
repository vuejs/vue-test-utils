import { mount, createWrapper } from '../'
import { normalOptions, functionalOptions, ClassComponent } from './resources'
import Vue from 'vue'

/**
 * Tests for BaseWrapper API
 */
let wrapper = mount(normalOptions)

let bool: boolean = wrapper.contains('.foo')
bool = wrapper.contains(normalOptions)
bool = wrapper.contains(ClassComponent)

bool = wrapper.exists()

bool = wrapper.attributes().foo === 'bar'
bool = wrapper.props().checked
bool = wrapper.classes('foo')

bool = wrapper.is(normalOptions)
bool = wrapper.isEmpty()
bool = wrapper.isVueInstance()

wrapper.vm.$emit('hello')

let n: number = wrapper.emitted().hello[0][0]
let o: string = wrapper.emitted('hello')[0]

const emittedByOrder = wrapper.emittedByOrder()
const name: string = emittedByOrder[0].name

wrapper.setData({ foo: 'bar' })
wrapper.setMethods({checked: true})
wrapper.setProps({ checked: true })
wrapper.trigger('mousedown.enter', {
  button: 0
})

/**
 * Tests for Wrapper API
 */
wrapper.vm.foo
wrapper.vm.$emit('event', 'arg')

let el: HTMLElement = wrapper.element

let found = wrapper.find('.foo')
found = wrapper.find(normalOptions)
found = wrapper.find(functionalOptions)
found = wrapper.find(ClassComponent)
found = wrapper.find({ ref: 'myButton' })
found = wrapper.find({ name: 'my-button' })

let array = wrapper.findAll('.bar')
array = wrapper.findAll(normalOptions)
array = wrapper.findAll(functionalOptions)
array = wrapper.findAll(ClassComponent)
array = wrapper.findAll({ ref: 'myButton' })
array = wrapper.findAll({ name: 'my-button' })

wrapper.setChecked()
wrapper.setChecked(true)
wrapper.setValue('some string')
wrapper.setSelected()
wrapper.props('foo')

let str: string = wrapper.html()
str = wrapper.text()
str = wrapper.name()
wrapper.attributes('foo')

/**
 * Tests for WrapperArray API
 */
let num: number = array.length
found = array.at(1)
array = array.filter((w, i, arr) => {
  i + 2
  arr.length
  return w.is('div')
})

let createdWrapper = createWrapper(new Vue().$mount())
createdWrapper.text()
createWrapper(document.createElement('div'))
createWrapper(document.createElement('div'), {
  attachedToDocument: true
})
createWrapper(document.createElement('div'), {
  attachedToDocument: true
})
