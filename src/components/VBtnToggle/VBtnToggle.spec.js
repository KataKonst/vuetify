import VBtnToggle from './VBtnToggle'
import VBtn from '../VBtn'
import VIcon from '../VIcon'
import { test } from '@util/testing'
import Vue from 'vue'

function createBtn (val = null) {
  const options = {
    props: { flat: true }
  }
  if (val) options.attrs = { value: val }

  return Vue.component('test', {
    components: {
      VBtn,
      VIcon
    },
    render (h) {
      return h('v-btn', options, [h('v-icon', 'add')])
    }
  })
}

function createFakeBtn() {
  return Vue.component('v-btn', {
    inject: ['buttonGroup'],
    methods: {
      testUnregister() {
        this.buttonGroup.unregister(this)
      }
    },
    mounted() {
      this.buttonGroup.register(this)
    },
    render (h) {
      return h('div')
    }
  })
}

test('VBtnToggle.vue', ({ mount }) => {
  it('should not allow empty value when mandatory prop is used', () => {
    const wrapper = mount(VBtnToggle, {
      propsData: {
        inputValue: 0,
        mandatory: true
      },
      slots: {
        default: [
          createBtn(),
          createBtn(),
          createBtn()
        ]
      }
    })

    const change = jest.fn()
    wrapper.instance().$on('change', change)

    wrapper.instance().updateValue(0)

    expect(change).not.toBeCalled()
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should allow new value when mandatory prop is used', () => {
    const wrapper = mount(VBtnToggle, {
      propsData: {
        inputValue: 1,
        mandatory: true
      },
      slots: {
        default: [
          createBtn(),
          createBtn(),
          createBtn()
        ]
      }
    })

    const change = jest.fn()
    wrapper.instance().$on('change', change)

    wrapper.instance().updateValue(0)

    expect(change).toBeCalledWith(0)
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should not allow empty value when mandatory prop is used with multiple prop', () => {
    const wrapper = mount(VBtnToggle, {
      propsData: {
        inputValue: [1],
        mandatory: true,
        multiple: true
      },
      slots: {
        default: [
          createBtn(),
          createBtn(),
          createBtn()
        ]
      }
    })

    const change = jest.fn()
    wrapper.instance().$on('change', change)

    wrapper.instance().updateValue(1)

    expect(change).not.toBeCalled()
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should allow new value when mandatory prop is used with multiple prop', () => {
    const wrapper = mount(VBtnToggle, {
      propsData: {
        inputValue: [1],
        mandatory: true,
        multiple: true
      },
      slots: {
        default: [
          createBtn(),
          createBtn(),
          createBtn()
        ]
      }
    })

    const change = jest.fn()
    wrapper.instance().$on('change', change)

    wrapper.instance().updateValue(2)

    expect(change).toBeCalledWith([1, 2])
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should use button value attribute if available', () => {
    const wrapper = mount(VBtnToggle, {
      propsData: {
        inputValue: 'center'
      },
      slots: {
        default: [
          createBtn('left'),
          createBtn('center'),
          createBtn('right')
        ]
      }
    })

    const change = jest.fn()
    wrapper.instance().$on('change', change)

    wrapper.instance().updateValue(2)

    expect(change).toBeCalledWith('right')
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should allow deselecting a value when mandatory prop is used with multiple prop', () => {
    const wrapper = mount(VBtnToggle, {
      propsData: {
        inputValue: [1, 2],
        mandatory: true,
        multiple: true
      },
      slots: {
        default: [
          createBtn(),
          createBtn(),
          createBtn()
        ]
      }
    })

    const change = jest.fn()
    wrapper.instance().$on('change', change)

    wrapper.instance().updateValue(2)

    expect(change).toBeCalledWith([1])
    expect(wrapper.html()).toMatchSnapshot()
  })

  it('should preserve mandatory invariant when selected child is unregistered', () => {
    const wrapper = mount(VBtnToggle, {
      propsData: {
        inputValue: 1,
        mandatory: true
      },
      slots: {
        default: [
          createBtn(),
          createFakeBtn()
        ]
      }
    })

    const change = jest.fn()
    wrapper.instance().$on('change', change)

    wrapper.vm.$children[1].testUnregister()
    wrapper.update()

    expect(change).toBeCalledWith(0)
  })

  it('should not set new value when not mandatory and selected child is unregistered', () => {
    const wrapper = mount(VBtnToggle, {
      propsData: {
        inputValue: 1,
      },
      slots: {
        default: [
          createBtn(),
          createFakeBtn()
        ]
      }
    })

    const change = jest.fn()
    wrapper.instance().$on('change', change)

    wrapper.vm.$children[1].testUnregister()
    wrapper.update()

    expect(change).not.toBeCalled()
  })

  it('should have btn with data-only-child if only one selected', () => {
    const wrapper = mount(VBtnToggle, {
      propsData: {
        inputValue: 0
      },
      slots: {
        default: [
          createBtn(),
          createBtn()
        ]
      }
    })

    const btn = wrapper.find('.btn')[0]

    expect(btn.getAttribute('data-only-child')).toBe('true')
  })

  it('should toggle values of any type', async () => {
    const values = [true, false, null, 6, 'foo', { key: 'value' }, ['arrayyy']]
    const verifyValues = [true, 1, 2, 6, 'foo', { key: 'value' }, ['arrayyy']]
    const buttons = values.map(v => createBtn(v))
    const wrapper = mount(VBtnToggle, {
      propsData: {
        inputValue: null
      },
      slots: { default: buttons }
    })

    const change = jest.fn()
    wrapper.vm.$on('change', change)

    wrapper.find('button').forEach((button, i) => {
      button.trigger('click')

      expect(change).toBeCalledWith(verifyValues[i])
    })

    expect(wrapper.html()).toMatchSnapshot()
  })
})
