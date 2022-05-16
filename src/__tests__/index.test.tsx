import { renderHook } from '@testing-library/react-hooks'
import { useBottomSheetMachine } from '..'

describe('useBottomSheetMachine', () => {
  test('returns context, dispatch and matches', () => {
    const { result } = renderHook(() => useBottomSheetMachine())
    expect(result.current).toMatchInlineSnapshot(`undefined`)
  })
})
