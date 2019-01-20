import { describeWithShallowAndMount } from '~resources/utils'

describeWithShallowAndMount('setSelected', mountingMethod => {
  it('sets value to the option elements', () => {
    const wrapperArray = mountingMethod({
      template: `
        <div>
          <select>
            <option/></option>
            <option class="foo"/>a</option>
          </select>
          <select>
            <option/></option>
            <option class="foo"/>b</option>
          </select>
        </div>`
    }).findAll('.foo')
    const fn = () => wrapperArray.setSelected()
    const message =
      '[vue-test-utils]: setSelected must be called on a single wrapper, use at(i) to access a wrapper'
    expect(fn)
      .to.throw()
      .with.property('message', message)
  })
})
