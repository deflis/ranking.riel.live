import { renderHook, act } from '@testing-library/react'
import { expect, test, describe } from 'vitest'
import { useToggle } from './useToggle'

describe('useToggle', () => {
  test('should initialize with the provided value', () => {
    const { result } = renderHook(() => useToggle(true))
    expect(result.current[0]).toBe(true)

    const { result: resultFalse } = renderHook(() => useToggle(false))
    expect(resultFalse.current[0]).toBe(false)
  })

  test('should toggle the value when called without arguments', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current[1]()
    })
    expect(result.current[0]).toBe(true)

    act(() => {
      result.current[1]()
    })
    expect(result.current[0]).toBe(false)
  })

  test('should set the value to the provided boolean argument', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current[1](true)
    })
    expect(result.current[0]).toBe(true)

    act(() => {
      result.current[1](true) // calling with true again should keep it true
    })
    expect(result.current[0]).toBe(true)

    act(() => {
      result.current[1](false)
    })
    expect(result.current[0]).toBe(false)
  })

  test('should fallback to toggling if provided argument is not boolean', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current[1]('string' as unknown)
    })
    expect(result.current[0]).toBe(true)

    act(() => {
      result.current[1]({} as unknown)
    })
    expect(result.current[0]).toBe(false)
  })
})
