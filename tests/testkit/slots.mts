/** Mount the same frame and conversation seats that the DSH renderer supplies. */
export function captureWithFrame(React, registered, name = 'conversation.composer.dock') {
  const capture = registered.find(entry => entry.meta.name === name).component
  const frame = registered.find(entry => entry.meta.name === 'shell.overlay').component
  return function TestSlots(props) {
    return React.createElement(React.Fragment, null, React.createElement(capture, props), React.createElement(frame))
  }
}
