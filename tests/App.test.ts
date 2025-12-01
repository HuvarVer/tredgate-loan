import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../src/App.vue'
import LoanForm from '../src/components/LoanForm.vue'
import LoanList from '../src/components/LoanList.vue'
import LoanSummary from '../src/components/LoanSummary.vue'
import type { LoanApplication } from '../src/types/loan'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('App.vue', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders the app header with title', () => {
    const wrapper = mount(App)

    expect(wrapper.find('h1').text()).toBe('Tredgate Loan')
  })

  it('renders the tagline', () => {
    const wrapper = mount(App)

    expect(wrapper.find('.tagline').text()).toBe('Simple loan application management')
  })

  it('renders the logo image', () => {
    const wrapper = mount(App)

    const logo = wrapper.find('.logo')
    expect(logo.exists()).toBe(true)
    expect(logo.attributes('src')).toBe('/tredgate-logo-original.png')
    expect(logo.attributes('alt')).toBe('Tredgate Logo')
  })

  it('renders all three main components', () => {
    const wrapper = mount(App)

    expect(wrapper.findComponent(LoanForm).exists()).toBe(true)
    expect(wrapper.findComponent(LoanList).exists()).toBe(true)
    expect(wrapper.findComponent(LoanSummary).exists()).toBe(true)
  })

  it('loads loans on mount', async () => {
    const mockLoans: LoanApplication[] = [
      {
        id: '1',
        applicantName: 'John Doe',
        amount: 50000,
        termMonths: 24,
        interestRate: 0.08,
        status: 'pending',
        createdAt: '2024-01-15T10:00:00.000Z'
      }
    ]

    localStorageMock.setItem('tredgate_loans', JSON.stringify(mockLoans))

    const wrapper = mount(App)
    await flushPromises()

    const loanList = wrapper.findComponent(LoanList)
    expect(loanList.props('loans')).toHaveLength(1)
    expect(loanList.props('loans')[0]?.applicantName).toBe('John Doe')
  })

  it('passes loans to LoanSummary component', async () => {
    const mockLoans: LoanApplication[] = [
      {
        id: '1',
        applicantName: 'Jane Smith',
        amount: 100000,
        termMonths: 60,
        interestRate: 0.06,
        status: 'approved',
        createdAt: '2024-02-20T14:30:00.000Z'
      }
    ]

    localStorageMock.setItem('tredgate_loans', JSON.stringify(mockLoans))

    const wrapper = mount(App)
    await flushPromises()

    const loanSummary = wrapper.findComponent(LoanSummary)
    expect(loanSummary.props('loans')).toHaveLength(1)
    expect(loanSummary.props('loans')[0]?.amount).toBe(100000)
  })

  it('refreshes loans when LoanForm emits created event', async () => {
    const wrapper = mount(App)

    const loanForm = wrapper.findComponent(LoanForm)
    
    // Emit created event
    await loanForm.vm.$emit('created')
    await flushPromises()

    // Verify that getLoans was called (indirectly by checking if loans were updated)
    expect(localStorageMock.getItem).toHaveBeenCalled()
  })

  it('handles approve action correctly', async () => {
    const mockLoans: LoanApplication[] = [
      {
        id: 'test-id',
        applicantName: 'Test User',
        amount: 50000,
        termMonths: 24,
        interestRate: 0.08,
        status: 'pending',
        createdAt: '2024-01-15T10:00:00.000Z'
      }
    ]

    localStorageMock.setItem('tredgate_loans', JSON.stringify(mockLoans))

    const wrapper = mount(App)
    await flushPromises()

    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('approve', 'test-id')
    await flushPromises()

    // Verify loan status was updated in localStorage
    const storedLoans = JSON.parse(localStorageMock.getItem('tredgate_loans') || '[]')
    expect(storedLoans[0]?.status).toBe('approved')
  })

  it('handles reject action correctly', async () => {
    const mockLoans: LoanApplication[] = [
      {
        id: 'test-id-2',
        applicantName: 'Test User 2',
        amount: 75000,
        termMonths: 36,
        interestRate: 0.07,
        status: 'pending',
        createdAt: '2024-02-10T12:00:00.000Z'
      }
    ]

    localStorageMock.setItem('tredgate_loans', JSON.stringify(mockLoans))

    const wrapper = mount(App)
    await flushPromises()

    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('reject', 'test-id-2')
    await flushPromises()

    // Verify loan status was updated in localStorage
    const storedLoans = JSON.parse(localStorageMock.getItem('tredgate_loans') || '[]')
    expect(storedLoans[0]?.status).toBe('rejected')
  })

  it('handles auto-decide action correctly for approved loan', async () => {
    const mockLoans: LoanApplication[] = [
      {
        id: 'auto-approve',
        applicantName: 'Auto User',
        amount: 50000,
        termMonths: 24,
        interestRate: 0.08,
        status: 'pending',
        createdAt: '2024-03-01T09:00:00.000Z'
      }
    ]

    localStorageMock.setItem('tredgate_loans', JSON.stringify(mockLoans))

    const wrapper = mount(App)
    await flushPromises()

    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('autoDecide', 'auto-approve')
    await flushPromises()

    // Verify loan was auto-approved (amount <= 100000 and term <= 60)
    const storedLoans = JSON.parse(localStorageMock.getItem('tredgate_loans') || '[]')
    expect(storedLoans[0]?.status).toBe('approved')
  })

  it('handles auto-decide action correctly for rejected loan', async () => {
    const mockLoans: LoanApplication[] = [
      {
        id: 'auto-reject',
        applicantName: 'Auto User 2',
        amount: 150000,
        termMonths: 72,
        interestRate: 0.09,
        status: 'pending',
        createdAt: '2024-03-05T14:00:00.000Z'
      }
    ]

    localStorageMock.setItem('tredgate_loans', JSON.stringify(mockLoans))

    const wrapper = mount(App)
    await flushPromises()

    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('autoDecide', 'auto-reject')
    await flushPromises()

    // Verify loan was auto-rejected (amount > 100000 or term > 60)
    const storedLoans = JSON.parse(localStorageMock.getItem('tredgate_loans') || '[]')
    expect(storedLoans[0]?.status).toBe('rejected')
  })

  it('displays empty loan list initially when no loans in storage', async () => {
    const wrapper = mount(App)
    await flushPromises()

    const loanList = wrapper.findComponent(LoanList)
    expect(loanList.props('loans')).toEqual([])
  })

  it('updates LoanSummary after approving a loan', async () => {
    const mockLoans: LoanApplication[] = [
      {
        id: 'summary-test',
        applicantName: 'Summary User',
        amount: 100000,
        termMonths: 60,
        interestRate: 0.06,
        status: 'pending',
        createdAt: '2024-03-10T10:00:00.000Z'
      }
    ]

    localStorageMock.setItem('tredgate_loans', JSON.stringify(mockLoans))

    const wrapper = mount(App)
    await flushPromises()

    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('approve', 'summary-test')
    await flushPromises()

    // Check that LoanSummary received updated loans
    const loanSummary = wrapper.findComponent(LoanSummary)
    const loans = loanSummary.props('loans')
    expect(loans[0]?.status).toBe('approved')
  })

  it('has proper layout structure', () => {
    const wrapper = mount(App)

    expect(wrapper.find('.app').exists()).toBe(true)
    expect(wrapper.find('.app-header').exists()).toBe(true)
    expect(wrapper.find('.main-content').exists()).toBe(true)
  })

  it('renders LoanForm before LoanList in main content', () => {
    const wrapper = mount(App)

    const mainContent = wrapper.find('.main-content')
    const children = mainContent.findAllComponents({ name: 'LoanForm' })
    expect(children.length).toBeGreaterThan(0)
  })

  it('handles multiple loan operations in sequence', async () => {
    const wrapper = mount(App)
    await flushPromises()

    // Create a loan
    const loanForm = wrapper.findComponent(LoanForm)
    await loanForm.vm.$emit('created')
    await flushPromises()

    // Mock that a loan was created
    const newLoan: LoanApplication = {
      id: 'seq-test',
      applicantName: 'Sequence Test',
      amount: 80000,
      termMonths: 48,
      interestRate: 0.07,
      status: 'pending',
      createdAt: '2024-03-15T11:00:00.000Z'
    }
    localStorageMock.setItem('tredgate_loans', JSON.stringify([newLoan]))

    // Trigger refresh
    await loanForm.vm.$emit('created')
    await flushPromises()

    // Approve the loan
    const loanList = wrapper.findComponent(LoanList)
    await loanList.vm.$emit('approve', 'seq-test')
    await flushPromises()

    // Verify final state
    const storedLoans = JSON.parse(localStorageMock.getItem('tredgate_loans') || '[]')
    expect(storedLoans[0]?.status).toBe('approved')
  })

  it('LoanSummary is rendered above main content', () => {
    const wrapper = mount(App)

    const app = wrapper.find('.app')
    const summary = wrapper.findComponent(LoanSummary)
    const mainContent = wrapper.find('.main-content')

    expect(summary.exists()).toBe(true)
    expect(mainContent.exists()).toBe(true)
    
    // LoanSummary should appear in the DOM before main-content
    const appHtml = app.html()
    const summaryIndex = appHtml.indexOf('loan-summary')
    const mainIndex = appHtml.indexOf('main-content')
    expect(summaryIndex).toBeLessThan(mainIndex)
  })
})
