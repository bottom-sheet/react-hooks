import { useMemo, useState } from 'react'
import { interpret } from 'xstate'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import {
  BottomSheetMachine,
  type BottomSheetContext,
  type BottomSheetEvent,
} from '@bottom-sheet/state-machine'

export function useBottomSheetMachine() {
  // useState lets us create the store exactly once, which is a guarantee that useMemo doesn't provide
  const [store] = useState(() => {
    const service = interpret(BottomSheetMachine)
    const matches: typeof service.state.matches = (parentStateValue) =>
      service.initialized
        ? service.state.matches(parentStateValue)
        : service.initialState.matches(parentStateValue)

    return {
      subscribe: (onStoreChange: () => void) => {
        service.onTransition((state) => {
          // @TODO: flesh out the logic for when to notify react of state changes or not (as state updates can be expensive and we should be transient when possible)
          if (state.changed) {
            onStoreChange()
          }
        })
        service.start()
        return () => void service.stop()
      },
      getSnapshot: () =>
        service.initialized
          ? service.state.context
          : service.initialState.context,
      matches,
      dispatch(event: BottomSheetEvent) {
        return service.send(event)
      },
    }
  })
  const context = useSyncExternalStore<BottomSheetContext>(
    store.subscribe,
    store.getSnapshot
  )

  return useMemo(
    () => ({
      context,
      getSnapshot: store.getSnapshot,
      dispatch: store.dispatch,
      matches: store.matches,
    }),
    [context, store.dispatch, store.getSnapshot, store.matches]
  )
}
