import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/** Mount the same frame and conversation seats that the DSH renderer supplies. */
export function captureWithFrame(React, registered, name = 'conversation.composer.dock') {
  // Load react-dom lazily inside captureWithFrame so callers can establish
  // globalThis.window/document before ReactDOM evaluates canUseDOM.
  const { createPortal } = require('react-dom')
  const capture = registered.find(entry => entry.meta.name === name).component
  const utilities = registered.find(entry => entry.meta.name === 'conversation.session.header.utilities')?.component
  const frame = registered.find(entry => entry.meta.name === 'shell.overlay').component
  return function TestSlots(props) {
    const utilitiesHost = typeof document === 'undefined'
      ? null
      : document.querySelector('[class*="_headerUtilities"]')
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(capture, props),
      utilities && utilitiesHost
        ? createPortal(React.createElement(utilities, props), utilitiesHost)
        : null,
      React.createElement(frame),
    )
  }
}
