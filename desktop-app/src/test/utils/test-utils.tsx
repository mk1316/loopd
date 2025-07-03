import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { UserContext } from '@/contexts/UserContext'
import { vi } from 'vitest'

// If UserContext is undefined, provide a fallback to avoid test crashes
const Context = UserContext ?? React.createContext(undefined)

// Mock user context provider
const MockUserProvider = ({ children }: { children: React.ReactNode }) => {
  const mockValue = {
    user: null,
    session: null,
    loading: false,
    signOut: vi.fn(),
    triggerSync: vi.fn(),
  }

  return (
    <Context.Provider value={mockValue}>
      {children}
    </Context.Provider>
  )
}

// Custom render function with providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: MockUserProvider, ...options })

export * from '@testing-library/react'
export { customRender as render } 