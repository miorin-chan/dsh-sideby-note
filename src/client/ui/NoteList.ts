/** Open/archived sections, their sticky heads, rows and the clear confirmation. */
import React from 'react'
import { ClearConfirm } from './ClearConfirm'
import { EmptyState } from './EmptyState'
import { normalizeArchiveOrder, normalizeOpenOrder, type SectionOrders } from '../domain/order'
import { IconChevron } from './primitives'

const h = React.createElement

interface SectionSortProps {
  section: keyof SectionOrders
  title: string
  say: (key: string, vars?: Record<string, string>) => string
  orders: SectionOrders
  chooseOrder: (patch: Partial<SectionOrders>) => void
}

// The native picker stays above the clipped scroll area and handles keyboard and touch input.
function SectionSort({ section, title, say, orders, chooseOrder }: SectionSortProps) {
  const label = say('sort.label', { section: title })
  const value = orders[section]
  const hint = value === 'workspace' ? say('sort.workspaceHint') : value === 'manual' ? say('item.reorder') : undefined
  const options = section === 'open' ? ['time', 'workspace', 'manual'] : ['time', 'workspace']
  return h('select', {
    className: 'dsh-an-sectionSort',
    'aria-label': label,
    'aria-description': hint,
    title: hint ?? label,
    value,
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => {
      const value = event.currentTarget.value
      chooseOrder(section === 'open'
        ? { open: normalizeOpenOrder(value) }
        : { done: normalizeArchiveOrder(value) })
    },
  }, options.map(value => h('option', { key: value, value }, say(`sort.${value}`))))
}

export function NoteList(props) {
  const {
    say, listRef, listHasMore, syncListEdge,
    showOpen, toggleOpen, openItems, openListRef, openCount, total, row, hideEmptyState,
    showDone, toggleDone, doneItems, orders, chooseOrder,
    clearConfirmText, confirmClear, askClearConfirm, dismissClearConfirm, confirmClearDone,
  } = props
  return     h(
        'div',
        {
          className: 'dsh-an-listViewport',
          'data-bottom': listHasMore ? 'true' : undefined,
        },
        h(
          'div',
          { className: 'dsh-an-listArea', ref: listRef, onScroll: syncListEdge },
          h(
            'div',
            { className: 'dsh-an-listSection' },
            h(
              'div',
              { className: 'dsh-an-sectionHead' },
              h(
                'button',
                {
                  type: 'button',
                  className: 'dsh-an-doneToggle',
                  'aria-expanded': showOpen ? 'true' : 'false',
                  onClick: toggleOpen,
                },
                h('span', { className: 'dsh-an-chevron', 'data-open': showOpen ? 'true' : 'false' }, h(IconChevron, null)),
                say('list.open'),
                openCount ? h('span', { className: 'dsh-an-sectionCount' }, String(openCount)) : null,
              ),
              h(SectionSort, { section: 'open', title: say('list.open'), say, orders, chooseOrder }),
            ),
            showOpen
              ? openItems.length
                ? h('ul', { className: 'dsh-an-rows', ref: openListRef }, openItems.map(row))
                : hideEmptyState ? null : h(EmptyState, {
                    title: say(total ? 'list.allArchived.title' : 'popover.empty.title'),
                    body: say(total ? 'list.allArchived.body' : 'popover.empty.body'),
                  })
              : null,
          ),
          doneItems.length
            ? h(
                'div',
                { className: 'dsh-an-listSection' },
                h(
                  'div',
                  { className: 'dsh-an-doneHead' },
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dsh-an-doneToggle',
                      'aria-expanded': showDone ? 'true' : 'false',
                      onClick: toggleDone,
                    },
                    h('span', { className: 'dsh-an-chevron', 'data-open': showDone ? 'true' : 'false' }, h(IconChevron, null)),
                    say('popover.archived'),
                    h('span', { className: 'dsh-an-sectionCount' }, String(doneItems.length)),
                  ),
                  h(SectionSort, { section: 'done', title: say('popover.archived'), say, orders, chooseOrder }),
                  showDone
                    ? h('button', {
                        type: 'button',
                        className: 'dsh-an-clear',
                        'aria-expanded': confirmClear ? 'true' : 'false',
                        onClick: askClearConfirm,
                      }, say('popover.clearArchived'))
                    : null,
                ),
                showDone && confirmClear
                  ? h(ClearConfirm, {
                      say,
                      text: clearConfirmText,
                      onCancel: dismissClearConfirm,
                      onConfirm: confirmClearDone,
                    })
                  : null,
                showDone ? h('ul', { className: 'dsh-an-rows dsh-an-doneRows' }, doneItems.map(row)) : null,
              )
            : null,
        ),
      )
}
