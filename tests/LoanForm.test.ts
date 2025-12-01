import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import LoanForm from '../src/components/LoanForm.vue'
import * as loanService from '../src/services/loanService'

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

describe('LoanForm.vue', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders the form with all input fields', () => {
    const wrapper = mount(LoanForm)

    expect(wrapper.find('h2').text()).toBe('New Loan Application')
    expect(wrapper.find('#applicantName').exists()).toBe(true)
    expect(wrapper.find('#amount').exists()).toBe(true)
    expect(wrapper.find('#termMonths').exists()).toBe(true)
    expect(wrapper.find('#interestRate').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('displays all form labels correctly', () => {
    const wrapper = mount(LoanForm)

    const labels = wrapper.findAll('label')
    expect(labels[0]?.text()).toBe('Applicant Name')
    expect(labels[1]?.text()).toBe('Loan Amount ($)')
    expect(labels[2]?.text()).toBe('Term (Months)')
    expect(labels[3]?.text()).toContain('Interest Rate')
  })

  it('shows error when submitting empty applicant name', async () => {
    const wrapper = mount(LoanForm)

    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe('Applicant name is required')
  })

  it('shows error when amount is 0', async () => {
    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue(0)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(0.08)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').text()).toBe('Amount must be greater than 0')
  })

  it('shows error when amount is negative', async () => {
    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue(-1000)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(0.08)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').text()).toBe('Amount must be greater than 0')
  })

  it('shows error when term months is 0', async () => {
    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(0)
    await wrapper.find('#interestRate').setValue(0.08)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').text()).toBe('Term months must be greater than 0')
  })

  it('shows error when interest rate is negative', async () => {
    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('John Doe')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(-0.05)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').text()).toContain('cannot be negative')
  })

  it('successfully creates loan application with valid data', async () => {
    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('Jane Smith')
    await wrapper.find('#amount').setValue(50000)
    await wrapper.find('#termMonths').setValue(36)
    await wrapper.find('#interestRate').setValue(0.07)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').exists()).toBe(false)
    const loans = loanService.getLoans()
    expect(loans.length).toBe(1)
    expect(loans[0]?.applicantName).toBe('Jane Smith')
    expect(loans[0]?.amount).toBe(50000)
    expect(loans[0]?.termMonths).toBe(36)
    expect(loans[0]?.interestRate).toBe(0.07)
  })

  it('emits created event on successful submission', async () => {
    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('Test User')
    await wrapper.find('#amount').setValue(25000)
    await wrapper.find('#termMonths').setValue(24)
    await wrapper.find('#interestRate').setValue(0.06)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.emitted('created')).toBeTruthy()
    expect(wrapper.emitted('created')?.length).toBe(1)
  })

  it('resets form after successful submission', async () => {
    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('Test User')
    await wrapper.find('#amount').setValue(25000)
    await wrapper.find('#termMonths').setValue(24)
    await wrapper.find('#interestRate').setValue(0.06)
    await wrapper.find('form').trigger('submit.prevent')

    await wrapper.vm.$nextTick()

    const applicantNameInput = wrapper.find<HTMLInputElement>('#applicantName')
    const amountInput = wrapper.find<HTMLInputElement>('#amount')
    const termMonthsInput = wrapper.find<HTMLInputElement>('#termMonths')
    const interestRateInput = wrapper.find<HTMLInputElement>('#interestRate')

    expect(applicantNameInput.element.value).toBe('')
    expect(amountInput.element.value).toBe('')
    expect(termMonthsInput.element.value).toBe('')
    expect(interestRateInput.element.value).toBe('')
  })

  it('trims whitespace from applicant name', async () => {
    const wrapper = mount(LoanForm)

    await wrapper.find('#applicantName').setValue('  John Doe  ')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(0.05)
    await wrapper.find('form').trigger('submit.prevent')

    const loans = loanService.getLoans()
    expect(loans[0]?.applicantName).toBe('John Doe')
  })

  it('handles service errors gracefully', async () => {
    const wrapper = mount(LoanForm)
    const errorSpy = vi.spyOn(loanService, 'createLoanApplication')
    errorSpy.mockImplementation(() => {
      throw new Error('Service error')
    })

    await wrapper.find('#applicantName').setValue('Test User')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(0.05)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe('Service error')

    errorSpy.mockRestore()
  })

  it('displays generic error message for non-Error exceptions', async () => {
    const wrapper = mount(LoanForm)
    const errorSpy = vi.spyOn(loanService, 'createLoanApplication')
    errorSpy.mockImplementation(() => {
      throw 'String error'
    })

    await wrapper.find('#applicantName').setValue('Test User')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(0.05)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').exists()).toBe(true)
    expect(wrapper.find('.error-message').text()).toBe('Failed to create loan application')

    errorSpy.mockRestore()
  })

  it('clears error message on new submission', async () => {
    const wrapper = mount(LoanForm)

    // First submission with error
    await wrapper.find('form').trigger('submit.prevent')
    expect(wrapper.find('.error-message').exists()).toBe(true)

    // Second submission with valid data
    await wrapper.find('#applicantName').setValue('Test User')
    await wrapper.find('#amount').setValue(10000)
    await wrapper.find('#termMonths').setValue(12)
    await wrapper.find('#interestRate').setValue(0.05)
    await wrapper.find('form').trigger('submit.prevent')

    expect(wrapper.find('.error-message').exists()).toBe(false)
  })

  it('has correct input types and attributes', () => {
    const wrapper = mount(LoanForm)

    const applicantNameInput = wrapper.find('#applicantName')
    const amountInput = wrapper.find('#amount')
    const termMonthsInput = wrapper.find('#termMonths')
    const interestRateInput = wrapper.find('#interestRate')

    expect(applicantNameInput.attributes('type')).toBe('text')
    expect(applicantNameInput.attributes('required')).toBeDefined()

    expect(amountInput.attributes('type')).toBe('number')
    expect(amountInput.attributes('min')).toBe('1')
    expect(amountInput.attributes('required')).toBeDefined()

    expect(termMonthsInput.attributes('type')).toBe('number')
    expect(termMonthsInput.attributes('min')).toBe('1')
    expect(termMonthsInput.attributes('required')).toBeDefined()

    expect(interestRateInput.attributes('type')).toBe('number')
    expect(interestRateInput.attributes('min')).toBe('0')
    expect(interestRateInput.attributes('max')).toBe('1')
    expect(interestRateInput.attributes('step')).toBe('0.01')
    expect(interestRateInput.attributes('required')).toBeDefined()
  })
})
