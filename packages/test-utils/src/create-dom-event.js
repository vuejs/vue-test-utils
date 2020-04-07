import eventTypes from 'dom-event-types'

const defaultEventType = {
  eventInterface: 'Event',
  cancelable: true,
  bubbles: true
}

const modifiers = {
  enter: 13,
  tab: 9,
  delete: 46,
  esc: 27,
  space: 32,
  up: 38,
  down: 40,
  left: 37,
  right: 39,
  end: 35,
  home: 36,
  backspace: 8,
  insert: 45,
  pageup: 33,
  pagedown: 34
}

function getOptions(eventParams) {
  const { modifier, meta, options } = eventParams
  const keyCode = modifiers[modifier] || options.keyCode || options.code

  return {
    ...options, // What the user passed in as the second argument to #trigger

    bubbles: meta.bubbles,
    cancelable: meta.cancelable,

    // Any derived options should go here
    keyCode,
    code: keyCode
  }
}

function createEvent(eventParams) {
  const { eventType, meta = {} } = eventParams

  const SupportedEventInterface =
    typeof window[meta.eventInterface] === 'function'
      ? window[meta.eventInterface]
      : window.Event

  const event = new SupportedEventInterface(
    eventType,
    // event properties can only be added when the event is instantiated
    // custom properties must be added after the event has been instantiated
    getOptions(eventParams)
  )

  return event
}

function createOldEvent(eventParams) {
  const { eventType, modifier, meta } = eventParams
  const { bubbles, cancelable } = meta

  const event = document.createEvent('Event')
  event.initEvent(eventType, bubbles, cancelable)
  event.keyCode = modifiers[modifier]
  return event
}

export default function createDOMEvent(type, options) {
  const [eventType, modifier] = type.split('.')
  const meta = eventTypes[eventType] || defaultEventType

  const eventParams = { eventType, modifier, meta, options }

  // Fallback for IE10,11 - https://stackoverflow.com/questions/26596123
  const event =
    typeof window.Event === 'function'
      ? createEvent(eventParams)
      : createOldEvent(eventParams)

  const eventPrototype = Object.getPrototypeOf(event)
  Object.keys(options || {}).forEach(key => {
    const propertyDescriptor = Object.getOwnPropertyDescriptor(
      eventPrototype,
      key
    )

    const canSetProperty = !(
      propertyDescriptor && propertyDescriptor.setter === undefined
    )
    if (canSetProperty) {
      event[key] = options[key]
    }
  })

  return event
}
