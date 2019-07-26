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
  pagedown: 34,
  f: 70,
  t: 84
}

function createEvent(
  type,
  modifier,
  { eventInterface, bubbles, cancelable },
  options
) {
  const SupportedEventInterface =
    typeof window[eventInterface] === 'function'
      ? window[eventInterface]
      : window.Event

  const event = new SupportedEventInterface(type, {
    // event properties can only be added when the event is instantiated
    // custom properties must be added after the event has been instantiated
    ...options,
    bubbles,
    cancelable,
    keyCode: modifiers[modifier]
  })

  return event
}

function createOldEvent(
  type,
  modifier,
  { eventInterface, bubbles, cancelable }
) {
  const event = document.createEvent('Event')
  event.initEvent(type, bubbles, cancelable)
  event.keyCode = modifiers[modifier]
  return event
}

export default function createDOMEvent(type, options) {
  const [eventType, modifier] = type.split('.')
  const meta = eventTypes[eventType] || defaultEventType

  // Fallback for IE10,11 - https://stackoverflow.com/questions/26596123
  const event =
    typeof window.Event === 'function'
      ? createEvent(eventType, modifier, meta, options)
      : createOldEvent(eventType, modifier, meta)

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
