import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('setChecked', mountingMethod => {
  it('sets value to the input elements of type checkbox or radio', async () => {
    const wrapper = mountingMethod({
      data() {
        return {
          t1: false,
          t2: ''
        }
      },
      template: `
        <div>
          <input type="checkbox" name="t1" class="foo" v-model="t1" />
          <input type="radio" name="t2" class="foo" value="foo" v-model="t2"/>
          <input type="radio" name="t2" class="bar" value="bar" v-model="t2"/>
        </div>`
    })
    const wrapperArray = wrapper.findAll('.foo')
    expect(wrapper.vm.t1).toEqual(false)
    expect(wrapper.vm.t2).toEqual('')
    await wrapperArray.setChecked()
    expect(wrapper.vm.t1).toEqual(true)
    expect(wrapper.vm.t2).toEqual('foo')
    expect(wrapperArray.at(0).element.checked).toEqual(true)
    expect(wrapperArray.at(1).element.checked).toEqual(true)
  })
})
