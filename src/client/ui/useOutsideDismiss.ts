/** Close the panel on an outside pointerdown or Escape. */
import React from 'react'

export function useOutsideDismiss(panelRef, anchorRef, onClose) {
  React.useEffect(() => {
    // The shared image viewer handles dismissal in its own portal.
    const imagePreviewOpen = () => panelRef.current?.querySelector('[data-image-preview-open]')
    const onPointerDown = event => {
      if (imagePreviewOpen()) return
      if (panelRef.current && panelRef.current.contains(event.target)) return
      if (anchorRef.current && anchorRef.current.contains(event.target)) return
      onClose(false)
    }
    const onKeyDown = event => {
      if (event.key === 'Escape' && !imagePreviewOpen()) onClose()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [onClose, anchorRef])
}
