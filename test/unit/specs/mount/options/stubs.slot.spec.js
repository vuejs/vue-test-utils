import mount from '~src/mount'

describe('options.stubs.slot', () => {
  it('replace slot', () => {
    const ScopedSlotComponent = {
      template: '<div><slot name="item" v-for="(item, index) in items" :index="index" :item="item"></slot></div>',
      data () {
        return {
          items: ['A', 'B', 'C']
        }
      }
    }
    const SlotStub = {
      name: 'slot-stub',
      render: h => h('div'),
      props: ['name', 'item', 'index']
    }
    const wrapper = mount(ScopedSlotComponent, { stubs: { slot: SlotStub }})
    const wrappers = wrapper.findAll(SlotStub)
    const results = [
      { index: 0, item: 'A', name: 'item' },
      { index: 1, item: 'B', name: 'item' },
      { index: 2, item: 'C', name: 'item' }
    ]
    for (let i = 0, max = wrappers.length; i < max; i++) {
      expect(wrappers.at(i).props()).to.deep.equal(results[i])
    }
  })
})
