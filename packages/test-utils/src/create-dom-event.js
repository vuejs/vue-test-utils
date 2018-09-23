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

export default function createDOMEvent (type, options) {
  const [eventType, modifier] = type.split('.')
  const {
    eventInterface,
    bubbles,
    cancelable
  } = eventTypes[eventType] || defaultEventType

  if (typeof window.Event === 'function') {
    const SupportedEventInterface =
     typeof window[eventInterface] === 'function'
       ? window[eventInterface]
       : window.Event

    return new SupportedEventInterface(eventType, {
      bubbles,
      cancelable,
      ...options,
      keyCode: modifiers[modifier]
    })
  }

  // Fallback for IE10,11 - https://stackoverflow.com/questions/26596123
  const eventObject = document.createEvent('Event')

  eventObject.initEvent(eventType, bubbles, cancelable)
  Object.keys(options || {}).forEach(key => {
    eventObject[key] = options[key]
  })
  eventObject.keyCode = modifiers[modifier]

  return eventObject
}
