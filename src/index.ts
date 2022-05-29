import {
  type BottomSheetEvent,
  BottomSheetMachine,
} from '@bottom-sheet/state-machine'
import {
  assignInitialHeight,
  assignSnapPoints,
  defaultInitialHeight,
  defaultSnapPoints,
} from '@bottom-sheet/state-machine'
import type { GetInitialHeight, GetSnapPoints } from '@bottom-sheet/types'
import { useMemo, useState } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import { interpret } from 'xstate'

export interface BottomSheetMachineProps {
  initialHeight?: number | GetInitialHeight
  snapPoints?: GetSnapPoints
}

function createStore({
  initialHeight = defaultInitialHeight,
  snapPoints = defaultSnapPoints,
}: BottomSheetMachineProps = {}) {
  console.debug('createStore')
  const service = interpret(
    BottomSheetMachine.withConfig({
      actions: {
        setInitialHeight: assignInitialHeight(
          typeof initialHeight === 'function'
            ? initialHeight
            : () => initialHeight
        ),
        setSnapPoints: assignSnapPoints(snapPoints),
      },
    })
  )
  let snapshot = service.initialState
  // transient is updated more frequently than the snapshot, outside of react render cycles
  let transient = snapshot
  let rAF = 0

  return {
    subscribe: (onStoreChange: () => void) => {
      console.debug('store.subscribe')
      service.onTransition((state) => {
        // @TODO: flesh out the logic for when to notify react of state changes or not (as state updates can be expensive and we should be transient when possible)
        // @TODO: put updateSnapshot actions in the state machine as declared events
        // for now just re-render on every change and map out events in userland before abstracting them to the state machine
        console.groupCollapsed('state.changed')
        transient = state
        console.log('transient', state.value, state.context)
        if (state.changed) {
          cancelAnimationFrame(rAF)
          rAF = requestAnimationFrame(() => {
            console.group('onStoreChange')
            console.log({ value: state.value, context: state.context })
            transient = snapshot = state
            onStoreChange()
            console.groupEnd()
          })
          console.groupEnd()
        }
        console.groupEnd()
      })
      console.debug('service.start')
      service.start()
      // return () => void service.stop()
      return () => {
        console.debug('service.stop')
        service.stop()
      }
    },
    getSnapshot: () => snapshot,
    getTransientSnapshot: () => transient,
    dispatch(event: BottomSheetEvent) {
      return service.send(event)
    },
  }
}

export const useBottomSheetMachine = function useBottomSheetMachine(
  props: BottomSheetMachineProps = {}
) {
  const [store] = useState(() => createStore(props))
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
      state,
      getTransientSnapshot: store.getTransientSnapshot,
      dispatch: store.dispatch,
    }),
    [state, store.dispatch, store.getTransientSnapshot]
  )
}

export type BottomSheetMachineHook = ReturnType<typeof useBottomSheetMachine>
