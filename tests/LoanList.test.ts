import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoanList from '../src/components/LoanList.vue'
import type { LoanApplication } from '../src/types/loan'

describe('LoanList.vue', () => {
  const mockLoans: LoanApplication[] = [
    {
      id: '1',
      applicantName: 'John Doe',
      amount: 50000,
      termMonths: 24,
      interestRate: 0.08,
      status: 'pending',
      createdAt: '2024-01-15T10:00:00.000Z'
    },
    {
      id: '2',
      applicantName: 'Jane Smith',
      amount: 100000,
      termMonths: 60,
      interestRate: 0.06,
      status: 'approved',
      createdAt: '2024-02-20T14:30:00.000Z'
    },
    {
      id: '3',
      applicantName: 'Bob Johnson',
      amount: 150000,
      termMonths: 72,
      interestRate: 0.09,
      status: 'rejected',
      createdAt: '2024-03-10T09:15:00.000Z'
    }
  ]

  it('renders the component with title', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [] }
    })

    expect(wrapper.find('h2').text()).toBe('Loan Applications')
  })

  it('displays empty state when no loans', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [] }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-state p').text()).toContain('No loan applications yet')
  })

  it('does not display empty state when loans exist', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })

    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  it('renders table with correct headers', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })

    const headers = wrapper.findAll('th')
    expect(headers[0]?.text()).toBe('Applicant')
    expect(headers[1]?.text()).toBe('Amount')
    expect(headers[2]?.text()).toBe('Term')
    expect(headers[3]?.text()).toBe('Rate')
    expect(headers[4]?.text()).toBe('Monthly Payment')
    expect(headers[5]?.text()).toBe('Status')
    expect(headers[6]?.text()).toBe('Created')
    expect(headers[7]?.text()).toBe('Actions')
  })

  it('displays all loans in the table', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(3)
  })

  it('displays applicant names correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows[0]?.text()).toContain('John Doe')
    expect(rows[1]?.text()).toContain('Jane Smith')
    expect(rows[2]?.text()).toContain('Bob Johnson')
  })

  it('formats currency correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    expect(wrapper.text()).toContain('$50,000.00')
  })

  it('displays term in months', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    expect(wrapper.text()).toContain('24 mo')
  })

  it('formats interest rate as percentage', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    expect(wrapper.text()).toContain('8.0%')
  })

  it('calculates and displays monthly payment', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    // amount * (1 + rate) / term = 50000 * 1.08 / 24 = 2250
    expect(wrapper.text()).toContain('$2,250.00')
  })

  it('displays status badges with correct classes', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })

    const statusBadges = wrapper.findAll('.status-badge')
    expect(statusBadges[0]?.classes()).toContain('status-pending')
    expect(statusBadges[1]?.classes()).toContain('status-approved')
    expect(statusBadges[2]?.classes()).toContain('status-rejected')
  })

  it('displays status text correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })

    const statusBadges = wrapper.findAll('.status-badge')
    expect(statusBadges[0]?.text()).toBe('pending')
    expect(statusBadges[1]?.text()).toBe('approved')
    expect(statusBadges[2]?.text()).toBe('rejected')
  })

  it('formats dates correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    // Check if date is formatted (exact format depends on locale, but should contain Jan and 2024)
    const text = wrapper.text()
    expect(text).toMatch(/Jan.*15.*2024/)
  })

  it('shows action buttons only for pending loans', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })

    const rows = wrapper.findAll('tbody tr')
    
    // Pending loan should have 3 action buttons
    const pendingButtons = rows[0]?.findAll('.action-btn')
    expect(pendingButtons?.length).toBe(3)

    // Approved loan should have no action buttons, just a dash
    const approvedButtons = rows[1]?.findAll('.action-btn')
    expect(approvedButtons?.length).toBe(0)
    expect(rows[1]?.find('.no-actions').exists()).toBe(true)

    // Rejected loan should have no action buttons, just a dash
    const rejectedButtons = rows[2]?.findAll('.action-btn')
    expect(rejectedButtons?.length).toBe(0)
    expect(rows[2]?.find('.no-actions').exists()).toBe(true)
  })

  it('approve button has correct styling', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const approveButton = wrapper.findAll('.action-btn')[0]
    expect(approveButton?.classes()).toContain('success')
    expect(approveButton?.text()).toBe('✓')
  })

  it('reject button has correct styling', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const rejectButton = wrapper.findAll('.action-btn')[1]
    expect(rejectButton?.classes()).toContain('danger')
    expect(rejectButton?.text()).toBe('✗')
  })

  it('auto-decide button has correct styling', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const autoDecideButton = wrapper.findAll('.action-btn')[2]
    expect(autoDecideButton?.classes()).toContain('secondary')
    expect(autoDecideButton?.text()).toBe('⚡')
  })

  it('emits approve event when approve button is clicked', async () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const approveButton = wrapper.findAll('.action-btn')[0]
    await approveButton?.trigger('click')

    expect(wrapper.emitted('approve')).toBeTruthy()
    expect(wrapper.emitted('approve')?.[0]).toEqual(['1'])
  })

  it('emits reject event when reject button is clicked', async () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const rejectButton = wrapper.findAll('.action-btn')[1]
    await rejectButton?.trigger('click')

    expect(wrapper.emitted('reject')).toBeTruthy()
    expect(wrapper.emitted('reject')?.[0]).toEqual(['1'])
  })

  it('emits autoDecide event when auto-decide button is clicked', async () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const autoDecideButton = wrapper.findAll('.action-btn')[2]
    await autoDecideButton?.trigger('click')

    expect(wrapper.emitted('autoDecide')).toBeTruthy()
    expect(wrapper.emitted('autoDecide')?.[0]).toEqual(['1'])
  })

  it('displays correct button titles for accessibility', () => {
    const wrapper = mount(LoanList, {
      props: { loans: [mockLoans[0]!] }
    })

    const buttons = wrapper.findAll('.action-btn')
    expect(buttons[0]?.attributes('title')).toBe('Approve')
    expect(buttons[1]?.attributes('title')).toBe('Reject')
    expect(buttons[2]?.attributes('title')).toBe('Auto-decide')
  })

  it('calculates monthly payment for different loan amounts', () => {
    const testLoan: LoanApplication = {
      id: 'test',
      applicantName: 'Test',
      amount: 12000,
      termMonths: 12,
      interestRate: 0.0,
      status: 'pending',
      createdAt: '2024-01-01T00:00:00.000Z'
    }

    const wrapper = mount(LoanList, {
      props: { loans: [testLoan] }
    })

    // 12000 * 1.0 / 12 = 1000
    expect(wrapper.text()).toContain('$1,000.00')
  })

  it('renders multiple loans with different statuses correctly', () => {
    const wrapper = mount(LoanList, {
      props: { loans: mockLoans }
    })

    const rows = wrapper.findAll('tbody tr')
    expect(rows.length).toBe(3)

    // Each row should have the correct applicant name
    expect(rows[0]?.text()).toContain('John Doe')
    expect(rows[1]?.text()).toContain('Jane Smith')
    expect(rows[2]?.text()).toContain('Bob Johnson')

    // Check statuses
    expect(rows[0]?.text()).toContain('pending')
    expect(rows[1]?.text()).toContain('approved')
    expect(rows[2]?.text()).toContain('rejected')
  })
})
