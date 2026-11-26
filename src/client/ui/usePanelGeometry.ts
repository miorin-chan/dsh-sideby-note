/** Panel geometry: remembered width/height, pointer and keyboard resize, placement. */
import React from 'react'
import {
  PANEL_DEFAULT_WIDTH,
  PANEL_MAX_WIDTH,
  PANEL_MIN_HEIGHT,
  PANEL_MIN_WIDTH,
} from '../constants'
import { readPanelHeight, readPanelWidth, writePanelHeight, writePanelWidth } from '../storage/prefs'
import { memoPopoverStyle } from './position'

export function usePanelGeometry(anchorRef, placement, panelRef) {
  const [panelWidth, setPanelWidth] = React.useState(readPanelWidth)
  const [panelHeight, setPanelHeight] = React.useState(readPanelHeight)
  const [style, setStyle] = React.useState(() => memoPopoverStyle(anchorRef.current, placement, panelWidth, panelHeight))
  const panelWidthRef = React.useRef(panelWidth)
  const panelHeightRef = React.useRef(panelHeight)
  const lastStyleRef = React.useRef('')
  const activeResizeCleanupRef = React.useRef<(() => void) | null>(null)

  React.useEffect(() => () => {
    activeResizeCleanupRef.current?.()
  }, [])

  const updatePosition = React.useCallback(() => {
    // Keep the last position while the host replaces the conversation header.
    if (anchorRef.current && !anchorRef.current.isConnected) return
    if (anchorRef.current || placement === 'right') {
      const next = memoPopoverStyle(anchorRef.current, placement, panelWidth, panelHeight)
      const key = JSON.stringify(next)
      if (key === lastStyleRef.current) return
      lastStyleRef.current = key
      setStyle(next)
    }
  }, [anchorRef, placement, panelWidth, panelHeight])

  React.useEffect(() => {
    panelWidthRef.current = panelWidth
  }, [panelWidth])

  React.useEffect(() => {
    panelHeightRef.current = panelHeight
  }, [panelHeight])

  const clampPanelWidth = value => {
    const max = Math.min(PANEL_MAX_WIDTH, Math.max(PANEL_MIN_WIDTH, window.innerWidth - 32))
    return Math.max(PANEL_MIN_WIDTH, Math.min(max, value))
  }

  const commitPanelWidth = value => {
    const next = clampPanelWidth(value)
    panelWidthRef.current = next
    setPanelWidth(next)
    writePanelWidth(next)
  }

  const beginPointerDrag = (cursor: string, onMoveEvent: (event: PointerEvent) => void, onCommit: () => void) => {
    activeResizeCleanupRef.current?.()
    const prevUserSelect = document.body.style.userSelect
    const prevCursor = document.body.style.cursor
    let finished = false
    const finish = (commit: boolean) => {
      if (finished) return
      finished = true
      window.removeEventListener('pointermove', onMoveEvent)
      window.removeEventListener('pointerup', onFinish)
      window.removeEventListener('pointercancel', onFinish)
      window.removeEventListener('blur', onFinish)
      document.body.style.userSelect = prevUserSelect
      document.body.style.cursor = prevCursor
      if (activeResizeCleanupRef.current === abortDrag) {
        activeResizeCleanupRef.current = null
      }
      if (commit) onCommit()
    }
    const onFinish = () => finish(true)
    const abortDrag = () => finish(false)
    activeResizeCleanupRef.current = abortDrag
    window.addEventListener('pointermove', onMoveEvent)
    window.addEventListener('pointerup', onFinish)
    window.addEventListener('pointercancel', onFinish)
    window.addEventListener('blur', onFinish)
    document.body.style.userSelect = 'none'
    document.body.style.cursor = cursor
  }

  const startPanelResize = event => {
    if (event.button !== 0) return
    event.preventDefault()
    const startX = event.clientX
    const startWidth = panelWidthRef.current
    const onMove = moveEvent => {
      const next = clampPanelWidth(startWidth + (startX - moveEvent.clientX))
      panelWidthRef.current = next
      setPanelWidth(next)
    }
    beginPointerDrag('ew-resize', onMove, () => writePanelWidth(panelWidthRef.current))
  }

  const onPanelResizeKeyDown = event => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      commitPanelWidth(panelWidthRef.current + 16)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      commitPanelWidth(panelWidthRef.current - 16)
    } else if (event.key === 'Home') {
      event.preventDefault()
      commitPanelWidth(PANEL_DEFAULT_WIDTH)
    }
  }

  const clampPanelHeight = value => {
    const max = Math.max(PANEL_MIN_HEIGHT, window.innerHeight - 64 - 16)
    return Math.max(PANEL_MIN_HEIGHT, Math.min(max, value))
  }

  const commitPanelHeight = value => {
    const next = value > 0 ? clampPanelHeight(value) : 0
    panelHeightRef.current = next
    setPanelHeight(next)
    writePanelHeight(next)
  }

  const startPanelHeightResize = event => {
    if (event.button !== 0) return
    event.preventDefault()
    const startY = event.clientY
    const startHeight = panelHeightRef.current
      || (panelRef.current ? panelRef.current.getBoundingClientRect().height : 360)
    const onMove = moveEvent => {
      const next = clampPanelHeight(startHeight + (moveEvent.clientY - startY))
      panelHeightRef.current = next
      setPanelHeight(next)
    }
    beginPointerDrag('ns-resize', onMove, () => writePanelHeight(panelHeightRef.current))
  }

  const onPanelHeightKeyDown = event => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      commitPanelHeight((panelHeightRef.current || 360) + 16)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      commitPanelHeight((panelHeightRef.current || 360) - 16)
    } else if (event.key === 'Home') {
      event.preventDefault()
      commitPanelHeight(0)
    }
  }

  React.useLayoutEffect(() => {
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [updatePosition])

  React.useEffect(() => {
    const anchor = anchorRef.current
    if (!anchor || typeof ResizeObserver !== 'function') return undefined
    const target = anchor.closest('[class*="_header"]') || anchor
    const observer = new ResizeObserver(updatePosition)
    observer.observe(target)
    return () => observer.disconnect()
  }, [anchorRef, updatePosition])

  React.useEffect(() => {
    const timer = window.setInterval(updatePosition, 400)
    return () => window.clearInterval(timer)
  }, [updatePosition])

  return {
    style,
    commitPanelWidth,
    commitPanelHeight,
    startPanelResize,
    startPanelHeightResize,
    onPanelResizeKeyDown,
    onPanelHeightKeyDown,
  }
}
