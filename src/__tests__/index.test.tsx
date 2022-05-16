import type { SnapPoints } from '@bottom-sheet/types'
import { computeSnapPoints, computeSnapPointBounds } from '../index'

describe('computeSnapPoints', () => {
  test('handles NaN and null', () => {
    expect(computeSnapPoints([NaN, null], 1)).toEqual([])
  })

  test('sorts the snap points in asc', () => {
    expect(computeSnapPoints([16, 64, 8, 32, 256, 128], 128)).toEqual([
      8, 16, 32, 64, 128,
    ])
  })
})

describe('computeSnapPointBounds', () => {
  test('handles NaN', () => {
    expect(computeSnapPointBounds(NaN, [0])).toMatchInlineSnapshot(`
      Array [
        0,
        0,
        0,
      ]
    `)
  })

  test('handles null', () => {
    expect(computeSnapPointBounds(null, [0])).toMatchInlineSnapshot(`
      Array [
        0,
        0,
        0,
      ]
    `)
  })

  test('handles negative height', () => {
    expect(computeSnapPointBounds(-32, [0])).toMatchInlineSnapshot(`
      Array [
        0,
        0,
        0,
      ]
    `)
  })

  test('handles 0 height', () => {
    expect(computeSnapPointBounds(1 / 3, [0])).toMatchInlineSnapshot(`
      Array [
        0,
        0,
        0,
      ]
    `)
  })

  test('memoizes the returned tuple on height', () => {
    const snapPoints: SnapPoints = [8, 16, 32]
    const initial = computeSnapPointBounds(12, snapPoints)
    expect(computeSnapPointBounds(12, snapPoints)).toBe(initial)
    expect(computeSnapPointBounds(20, snapPoints)).not.toBe(initial)
  })

  test('memoizes the returned tuple on snap points', () => {
    const height = 16
    const initial = computeSnapPointBounds(height, [8])
    expect(computeSnapPointBounds(height, [8])).toBe(initial)
    expect(computeSnapPointBounds(height, [32])).not.toBe(initial)
  })

  test('snapPoints: [32]', () => {
    const snapPoints: SnapPoints = [32]
    const expected: ReturnType<typeof computeSnapPointBounds> = [32, 32, 32]
    expect(computeSnapPointBounds(16, snapPoints)).toEqual(expected)
    expect(computeSnapPointBounds(32, snapPoints)).toEqual(expected)
    expect(computeSnapPointBounds(64, snapPoints)).toEqual(expected)
  })

  describe('snapPoints: [32, 64]', () => {
    const snapPoints: SnapPoints = [32, 64]
    test('height: 32', () => {
      const expected: ReturnType<typeof computeSnapPointBounds> = [32, 32, 64]
      expect(computeSnapPointBounds(16, snapPoints)).toEqual(expected)
      expect(computeSnapPointBounds(32, snapPoints)).toEqual(expected)
      expect(computeSnapPointBounds(48, snapPoints)).toEqual(expected)
    })

    test('height: 64', () => {
      const expected: ReturnType<typeof computeSnapPointBounds> = [64, 32, 64]
      expect(computeSnapPointBounds(48.5, snapPoints)).toEqual(expected)
      expect(computeSnapPointBounds(64, snapPoints)).toEqual(expected)
      expect(computeSnapPointBounds(128, snapPoints)).toEqual(expected)
    })
  })

  describe('snapPoints: [32, 64, 128, 256, 512]', () => {
    const snapPoints: SnapPoints = [32, 64, 128, 256, 512]
    test('height: 32', () => {
      const expected: ReturnType<typeof computeSnapPointBounds> = [32, 32, 64]
      expect(computeSnapPointBounds(0.5, snapPoints)).toEqual(expected)
      expect(computeSnapPointBounds(32, snapPoints)).toEqual(expected)
      expect(computeSnapPointBounds(48, snapPoints)).toEqual(expected)
    })

    test('height: 512', () => {
      const expected: ReturnType<typeof computeSnapPointBounds> = [
        512, 256, 512,
      ]
      expect(computeSnapPointBounds(384.5, snapPoints)).toEqual(expected)
      expect(computeSnapPointBounds(512, snapPoints)).toEqual(expected)
      expect(computeSnapPointBounds(1024, snapPoints)).toEqual(expected)
    })

    test('height: 128 => [128, 64, 256]', () => {
      const expected: ReturnType<typeof computeSnapPointBounds> = [128, 64, 256]
      expect(computeSnapPointBounds(96.5, snapPoints)).toEqual(expected)
      expect(computeSnapPointBounds(128, snapPoints)).toEqual(expected)
      expect(computeSnapPointBounds(192, snapPoints)).toEqual(expected)
    })
  })
})
