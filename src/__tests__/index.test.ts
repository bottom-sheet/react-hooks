import { renderHook } from '@testing-library/react-hooks'
import { useBottomSheetMachine } from '..'

describe('useBottomSheetMachine', () => {
  test('returns state.context, dispatch and state.matches', () => {
    const { result } = renderHook(() => useBottomSheetMachine())
    expect(result.current).toMatchInlineSnapshot(`undefined`)
  })
})
