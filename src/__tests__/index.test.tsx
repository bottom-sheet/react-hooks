import { renderHook, act } from '@testing-library/react-hooks'
import { useBottomSheetMachine } from '..'

describe('useBottomSheetMachine', () => {
  test('returns state.context, dispatch and state.matches', () => {
    const { result } = renderHook(() => useBottomSheetMachine())
    expect(result.current).toEqual({
      context: expect.any(Object),
      dispatch: expect.any(Function),
      getSnapshot: expect.any(Function),
      //initialized: false,
      initialized: expect.any(Boolean),
      matches: expect.any(Function),
    })
    expect(result.current.context).toMatchInlineSnapshot(`
      Object {
        "contentHeight": null,
        "footerHeight": null,
        "headerHeight": null,
        "height": 0,
        "initialHeight": 0,
        "lastHeight": null,
        "maxContent": 0,
        "maxHeight": 0,
        "minContent": 0,
        "snapPoints": Array [],
      }
    `)
    expect(result.current.matches('closed')).toBe(true)
  })

  test('maxHeight', async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useBottomSheetMachine()
    )

    act(() => {
      result.current.dispatch({
        type: 'SET_MAX_HEIGHT',
        payload: { maxHeight: 512 },
      })
    })

    // await waitForNextUpdate()

    expect(result.current.context).toMatchInlineSnapshot(`
      Object {
        "contentHeight": null,
        "footerHeight": null,
        "headerHeight": null,
        "height": 0,
        "initialHeight": 0,
        "lastHeight": null,
        "maxContent": 0,
        "maxHeight": 0,
        "minContent": 0,
        "snapPoints": Array [],
      }
    `)
    expect(result.current.initialized).toBe(true)
    expect(result.current.context.maxHeight).toBe(512)
  })
})
