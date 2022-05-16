import { useMemo } from 'react'
import { interpret } from 'xstate'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import {
  BottomSheetMachine,
  type BottomSheetEvent,
} from '@bottom-sheet/state-machine'

function createStore() {
  const service = interpret(BottomSheetMachine)
  const matches: typeof service.state.matches = (parentStateValue) =>
    service.initialized
      ? service.state.matches(parentStateValue)
      : service.initialState.matches(parentStateValue)

  return {
    subscribe: (onStoreChange: () => void) => {
      console.log('subscribe called!')
      service.onTransition((state) => {
        // @TODO: flesh out the logic for when to notify react of state changes or not (as state updates can be expensive and we should be transient when possible)
        if (state.changed) {
          onStoreChange()
        }
      })
      service.start()
      return () => void service.stop()
    },
    getInitialized() {
      return service.initialized
    },
    getSnapshot: () =>
      service.initialized ? service.state : service.initialState,
    matches,
    dispatch(event: BottomSheetEvent) {
      return service.send(event)
    },
  }
}
const store = createStore()

export function useBottomSheetMachine() {
  /*
  // useState lets us create the store exactly once, which is a guarantee that useMemo doesn't provide
  const [store] = useState(() => {
    const service = interpret(BottomSheetMachine)
    const matches: typeof service.state.matches = (parentStateValue) =>
      service.initialized
        ? service.state.matches(parentStateValue)
        : service.initialState.matches(parentStateValue)

    return {
      subscribe: (onStoreChange: () => void) => {
        console.log('subscribe called!')
        service.onTransition((state) => {
          // @TODO: flesh out the logic for when to notify react of state changes or not (as state updates can be expensive and we should be transient when possible)
          if (state.changed) {
            onStoreChange()
          }
        })
        service.start()
        return () => void service.stop()
      },
      getInitialized() {
        return service.initialized
      },
      getSnapshot: () =>
        service.initialized ? service.state : service.initialState,
      matches,
      dispatch(event: BottomSheetEvent) {
        return service.send(event)
      },
    }
  })
  // */
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot)

  /*
  const [inc, tick] = useState(0)
  useEffect(() => {
    const unsubscribe = store.subscribe(() => tick((inc) => ++inc))
    return () => unsubscribe()
  }, [])
  // */

  return useMemo(
    () => ({
      context: state.context,
      getSnapshot: store.getSnapshot,
      dispatch: store.dispatch,
      matches: store.matches,
      get initialized() {
        return store.getInitialized()
      },
    }),
    [state.context]
  )
}
