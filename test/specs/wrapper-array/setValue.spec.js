import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('setValue', mountingMethod => {
  it('sets value to the text-control input elements', () => {
    const wrapper = mountingMethod({
      data() {
        return {
          t1: '',
          t2: ''
        }
      },
      template: `
        <div>
          <input type="text" name="t1" class="foo" v-model="t1" />
          <input type="text" name="t2" class="foo" v-model="t2"/>
        </div>`
    })
    const wrapperArray = wrapper.findAll('.foo')
    expect(wrapper.vm.t1).toEqual('')
    expect(wrapper.vm.t2).toEqual('')
    wrapperArray.setValue('foo')
    expect(wrapper.vm.t1).toEqual('foo')
    expect(wrapper.vm.t2).toEqual('foo')
    expect(wrapperArray.at(0).element.value).toEqual('foo')
    expect(wrapperArray.at(1).element.value).toEqual('foo')
  })
})
