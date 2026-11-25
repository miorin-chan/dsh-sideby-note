/** Close the panel with Escape without intercepting native modal or menu actions. */
import React from 'react'

export function usePanelEscape(onClose: () => void) {
  React.useEffect(() => {
    const inOverlay = (target: EventTarget | null) => target instanceof Element && target.closest('[aria-modal="true"], [role="menu"]')
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.repeat || event.isComposing || event.keyCode === 229) return
      if (inOverlay(document.activeElement) || inOverlay(event.target)) return
      event.preventDefault()
      onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])
}
