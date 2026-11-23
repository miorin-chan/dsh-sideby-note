/**
 * Drag an open note to reorder it, or press the up/down arrows while its
 * leading action has focus.
 *
 * The drag runs outside React: rows follow the pointer through inline
 * transforms, so a long list never re-renders per frame. Only the drop goes
 * through `onMove`, and the lifted row then glides from where it was let go
 * into its new slot (a FLIP in the layout effect below).
 */
import React from 'react'

/** Vertical pixels the pointer travels before a press becomes a drag. */
const DRAG_THRESHOLD = 4
/** Distance from the scroller's edge where a held drag starts scrolling it. */
const EDGE_ZONE = 32
/** Fastest auto-scroll step, in pixels per frame, right at the edge. */
const EDGE_SPEED = 8

export function useRowReorder({ ids, groupFor, scrollRef, onMove }) {
  const listRef = React.useRef<HTMLUListElement | null>(null)
  const dragRef = React.useRef<any>(null)
  const settleRef = React.useRef<{ id: string, top: number } | null>(null)
  const focusRef = React.useRef('')
  const idsRef = React.useRef(ids)
  idsRef.current = ids
  const groupRef = React.useRef(groupFor)
  groupRef.current = groupFor
  const onMoveRef = React.useRef(onMove)
  onMoveRef.current = onMove

  // One stable set of handlers: they only read refs, so window listeners can
  // be added and removed by identity.
  const [api] = React.useState(() => {
    const rows = () => {
      const list = listRef.current
      if (!list) return []
      return Array.from(list.children).filter((node: any) => node && node.dataset && node.dataset.rowId) as HTMLElement[]
    }

    /** Move the lifted row with the pointer and open a gap where it would land. */
    const layout = drag => {
      const scrolled = drag.scroller ? drag.scroller.scrollTop - drag.startScroll : 0
      const dy = drag.lastY - drag.startY + scrolled
      drag.dy = dy
      const self = drag.rows[drag.from]
      const center = self.top + dy + self.height / 2
      let to = drag.first
      drag.rows.forEach((row, index) => {
        if (index >= drag.first && index <= drag.last && index !== drag.from && row.top + row.height / 2 < center) to += 1
      })
      drag.to = to
      const shift = self.height + drag.gap
      drag.rows.forEach((row, index) => {
        if (index === drag.from) {
          row.node.style.transform = `translateY(${dy}px)`
          return
        }
        let offset = 0
        if (drag.from < to && index > drag.from && index <= to) offset = -shift
        else if (to < drag.from && index >= to && index < drag.from) offset = shift
        row.node.style.transform = offset ? `translateY(${offset}px)` : ''
      })
    }

    /** Signed scroll step while the pointer rests near the scroller's top or bottom edge. */
    const edgeStep = drag => {
      const scroller = drag.scroller
      if (!scroller) return 0
      const rect = scroller.getBoundingClientRect()
      const fromTop = drag.lastY - rect.top
      const fromBottom = rect.bottom - drag.lastY
      if (fromTop < EDGE_ZONE) return -Math.ceil(EDGE_SPEED * (1 - Math.max(0, fromTop) / EDGE_ZONE))
      if (fromBottom < EDGE_ZONE) return Math.ceil(EDGE_SPEED * (1 - Math.max(0, fromBottom) / EDGE_ZONE))
      return 0
    }

    const tick = () => {
      const drag = dragRef.current
      if (!drag) return
      drag.frame = 0
      const step = edgeStep(drag)
      if (!step) return
      drag.scroller.scrollTop += step
      drag.frame = window.requestAnimationFrame(tick)
    }

    const onScroll = () => {
      const drag = dragRef.current
      if (drag && drag.started) layout(drag)
    }

    const onEscape = event => {
      if (event.key !== 'Escape') return
      // Escape cancels the drag only; it must not also close the panel.
      event.preventDefault()
      event.stopPropagation()
      finish(false)
    }

    /** Put every row back to its own slot; the row transition glides them there. */
    const release = drag => {
      const list = listRef.current
      if (list) delete list.dataset.dragging
      for (const row of drag.rows) {
        row.node.style.transform = ''
        delete row.node.dataset.dragging
      }
    }

    const finish = commit => {
      const drag = dragRef.current
      if (!drag) return
      dragRef.current = null
      if (drag.frame) window.cancelAnimationFrame(drag.frame)
      window.removeEventListener('keydown', onEscape, true)
      if (drag.scroller) drag.scroller.removeEventListener('scroll', onScroll)
      try {
        drag.target.releasePointerCapture(drag.pointerId)
      } catch {
        /* capture may already be gone */
      }
      if (!drag.started) return
      if (commit && drag.to !== drag.from) {
        // Remember where the lifted row hangs now; the layout effect lands it
        // after React has rendered the new order.
        const settle = { id: drag.id, top: drag.rows[drag.from].top + drag.dy }
        settleRef.current = settle
        const cancelSettle = () => {
          if (settleRef.current !== settle) return
          settleRef.current = null
          release(drag)
        }
        void onMoveRef.current(drag.id, drag.to).then(ok => {
          if (!ok) cancelSettle()
        }, cancelSettle)
        return
      }
      release(drag)
    }

    const start = (id: string, event: React.PointerEvent<HTMLLIElement>) => {
      if (event.button !== 0 || dragRef.current || settleRef.current) return
      const origin = event.target
      const target = event.currentTarget
      if (!(origin instanceof window.Element) || !target.contains(origin)) return
      if (origin.closest('button, a, audio, video, img')) return
      if (event.pointerType === 'touch' && !origin.closest('.dsh-an-rowBody')) return
      const list = listRef.current
      const all = rows()
      const from = all.findIndex(node => node.dataset.rowId === id)
      if (!list || from < 0) return
      const group = groupRef.current(id)
      let first = from
      let last = from
      while (first > 0 && groupRef.current(all[first - 1].dataset.rowId) === group) first -= 1
      while (last < all.length - 1 && groupRef.current(all[last + 1].dataset.rowId) === group) last += 1
      if (first === last) return
      event.preventDefault()
      try {
        target.setPointerCapture(event.pointerId)
      } catch {
        /* older engines still deliver moves over the row */
      }
      const listTop = list.getBoundingClientRect().top
      const scroller = scrollRef.current || null
      dragRef.current = {
        id,
        from,
        first,
        last,
        to: from,
        target,
        pointerId: event.pointerId,
        startY: event.clientY,
        lastY: event.clientY,
        dy: 0,
        scroller,
        startScroll: scroller ? scroller.scrollTop : 0,
        gap: parseFloat(window.getComputedStyle(list).rowGap) || 0,
        rows: all.map(node => {
          const rect = node.getBoundingClientRect()
          return { node, top: rect.top - listTop, height: rect.height }
        }),
        started: false,
        frame: 0,
      }
    }

    const move = (event: React.PointerEvent<HTMLLIElement>) => {
      const drag = dragRef.current
      if (!drag || event.currentTarget !== drag.target || event.pointerId !== drag.pointerId) return
      drag.lastY = event.clientY
      if (!drag.started) {
        if (Math.abs(drag.lastY - drag.startY) < DRAG_THRESHOLD) return
        drag.started = true
        const list = listRef.current
        if (list) list.dataset.dragging = 'true'
        drag.rows[drag.from].node.dataset.dragging = 'true'
        window.addEventListener('keydown', onEscape, true)
        if (drag.scroller) drag.scroller.addEventListener('scroll', onScroll)
      }
      layout(drag)
      if (!drag.frame && edgeStep(drag)) drag.frame = window.requestAnimationFrame(tick)
    }

    const finishPointer = (event: React.PointerEvent<HTMLLIElement>, commit: boolean) => {
      const drag = dragRef.current
      if (drag?.target === event.currentTarget && drag.pointerId === event.pointerId) finish(commit)
    }

    /** Arrow keys move the focused note one slot; its leading action keeps focus. */
    const key = (id: string, event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return
      event.preventDefault()
      if (dragRef.current) return
      const order = idsRef.current
      const index = order.indexOf(id)
      const to = index + (event.key === 'ArrowUp' ? -1 : 1)
      if (index < 0 || to < 0 || to >= order.length || groupRef.current(order[to]) !== groupRef.current(id)) return
      focusRef.current = id
      const clearFocus = () => {
        if (focusRef.current === id) focusRef.current = ''
      }
      void onMoveRef.current(id, to).then(ok => {
        if (!ok) clearFocus()
      }, clearFocus)
    }

    return { rows, start, move, finish, finishPointer, key }
  })

  const idsKey = ids.join('\n')
  React.useLayoutEffect(() => {
    // A drag's positions belong to the list order captured at pointerdown.
    api.finish(false)
    const list = listRef.current
    const settle = settleRef.current
    if (settle && list) {
      settleRef.current = null
      delete list.dataset.dragging
      const nodes = api.rows()
      // Snap every row to its new slot without animating: the rows that made
      // room already stand exactly there, so nothing visibly moves...
      for (const node of nodes) {
        node.style.transition = 'none'
        node.style.transform = ''
        delete node.dataset.dragging
      }
      const lifted = nodes.find(node => node.dataset.rowId === settle.id)
      if (lifted) {
        const natural = lifted.getBoundingClientRect().top - list.getBoundingClientRect().top
        lifted.style.transform = `translateY(${settle.top - natural}px)`
      }
      void list.offsetHeight
      // ...except the lifted row, which glides from the drop point into it.
      for (const node of nodes) node.style.transition = ''
      if (lifted) lifted.style.transform = ''
    }
    const focusId = focusRef.current
    if (focusId && list) {
      focusRef.current = ''
      const row = api.rows().find(node => node.dataset.rowId === focusId)
      const action = row?.querySelector<HTMLButtonElement>('.dsh-an-insert')
      if (action && document.activeElement !== action) action.focus()
    }
  }, [idsKey, api])

  // Closing the panel mid-drag must not leave a window listener behind.
  React.useEffect(() => () => api.finish(false), [api])

  const dragProps = (id: string): React.DOMAttributes<HTMLLIElement> => ({
    onPointerDown: event => api.start(id, event),
    onPointerMove: api.move,
    onPointerUp: event => api.finishPointer(event, true),
    onPointerCancel: event => api.finishPointer(event, false),
    onLostPointerCapture: event => api.finishPointer(event, false),
  })
  const reorderKey = (id: string): React.KeyboardEventHandler<HTMLButtonElement> => event => api.key(id, event)

  return { listRef, dragProps, reorderKey }
}
