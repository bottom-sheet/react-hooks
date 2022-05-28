import { render } from '@testing-library/react'
import React, { useEffect } from 'react'
import { useBottomSheetMachine } from '..'

describe('useBottomSheetMachine', () => {
  test('SET_MAX_HEIGHT', async () => {
    function Printer() {
      const { dispatch, state } = useBottomSheetMachine()
      useEffect(
        () =>
          void dispatch({
            type: 'SET_MAX_HEIGHT',
            payload: { maxHeight: 512 },
          }),
        [dispatch]
      )
      return <div>maxHeight: {state.context.maxHeight}</div>
    }
    const { findByText } = render(<Printer />)

    // eslint-disable-next-line testing-library/prefer-screen-queries
    await findByText('maxHeight: 512')
  })
})
