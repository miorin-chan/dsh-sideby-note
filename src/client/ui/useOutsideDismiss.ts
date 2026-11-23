/** Close the panel on an outside pointerdown or Escape. */
import React from 'react'

export function useOutsideDismiss(panelRef, anchorRef, onClose) {
  React.useEffect(() => {
    // The native image viewer and its menu handle their own portaled interactions.
    const inOverlay = (target: EventTarget | null) => target instanceof Element && target.closest('[aria-modal="true"], [role="menu"]')
    const onPointerDown = (event: PointerEvent) => {
      if (inOverlay(event.target)) return
      if (event.target instanceof Node && (panelRef.current?.contains(event.target) || anchorRef.current?.contains(event.target))) return
      onClose(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.repeat || event.isComposing || event.keyCode === 229) return
      if (inOverlay(document.activeElement) || inOverlay(event.target)) return
      event.preventDefault()
      onClose()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, anchorRef])
}
