import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoanSummary from '../src/components/LoanSummary.vue'
import type { LoanApplication } from '../src/types/loan'

describe('LoanSummary.vue', () => {
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
      applicantName: 'Alice Johnson',
      amount: 75000,
      termMonths: 36,
      interestRate: 0.07,
      status: 'approved',
      createdAt: '2024-03-05T11:20:00.000Z'
    },
    {
      id: '4',
      applicantName: 'Bob Wilson',
      amount: 150000,
      termMonths: 72,
      interestRate: 0.09,
      status: 'rejected',
      createdAt: '2024-03-10T09:15:00.000Z'
    },
    {
      id: '5',
      applicantName: 'Charlie Brown',
      amount: 25000,
      termMonths: 12,
      interestRate: 0.05,
      status: 'rejected',
      createdAt: '2024-03-12T15:45:00.000Z'
    }
  ]

  it('renders all stat cards', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: [] }
    })

    const statCards = wrapper.findAll('.stat-card')
    expect(statCards.length).toBe(5)
  })

  it('displays correct total applications count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    const totalCard = statCards[0]
    expect(totalCard?.find('.stat-value').text()).toBe('5')
    expect(totalCard?.find('.stat-label').text()).toBe('Total Applications')
  })

  it('displays correct pending count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    const pendingCard = statCards[1]
    expect(pendingCard?.find('.stat-value').text()).toBe('1')
    expect(pendingCard?.find('.stat-label').text()).toBe('Pending')
  })

  it('displays correct approved count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    const approvedCard = statCards[2]
    expect(approvedCard?.find('.stat-value').text()).toBe('2')
    expect(approvedCard?.find('.stat-label').text()).toBe('Approved')
  })

  it('displays correct rejected count', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    const rejectedCard = statCards[3]
    expect(rejectedCard?.find('.stat-value').text()).toBe('2')
    expect(rejectedCard?.find('.stat-label').text()).toBe('Rejected')
  })

  it('calculates total approved amount correctly', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    const amountCard = statCards[4]
    // Only approved loans: 100000 + 75000 = 175000
    expect(amountCard?.find('.stat-value').text()).toBe('$175,000')
    expect(amountCard?.find('.stat-label').text()).toBe('Total Approved')
  })

  it('shows zero values when no loans', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: [] }
    })

    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('0')
    expect(statCards[1]?.find('.stat-value').text()).toBe('0')
    expect(statCards[2]?.find('.stat-value').text()).toBe('0')
    expect(statCards[3]?.find('.stat-value').text()).toBe('0')
    expect(statCards[4]?.find('.stat-value').text()).toBe('$0')
  })

  it('applies correct CSS classes to stat cards', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[1]?.classes()).toContain('pending')
    expect(statCards[2]?.classes()).toContain('approved')
    expect(statCards[3]?.classes()).toContain('rejected')
    expect(statCards[4]?.classes()).toContain('amount')
  })

  it('displays zero approved amount when no approved loans', () => {
    const loansWithoutApproved: LoanApplication[] = [
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
        status: 'rejected',
        createdAt: '2024-02-20T14:30:00.000Z'
      }
    ]

    const wrapper = mount(LoanSummary, {
      props: { loans: loansWithoutApproved }
    })

    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[4]?.find('.stat-value').text()).toBe('$0')
  })

  it('handles single loan correctly', () => {
    const singleLoan: LoanApplication[] = [
      {
        id: '1',
        applicantName: 'John Doe',
        amount: 50000,
        termMonths: 24,
        interestRate: 0.08,
        status: 'approved',
        createdAt: '2024-01-15T10:00:00.000Z'
      }
    ]

    const wrapper = mount(LoanSummary, {
      props: { loans: singleLoan }
    })

    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('1')
    expect(statCards[1]?.find('.stat-value').text()).toBe('0')
    expect(statCards[2]?.find('.stat-value').text()).toBe('1')
    expect(statCards[3]?.find('.stat-value').text()).toBe('0')
    expect(statCards[4]?.find('.stat-value').text()).toBe('$50,000')
  })

  it('updates stats when loans prop changes', async () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: [] }
    })

    let statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('0')

    await wrapper.setProps({ loans: mockLoans })

    statCards = wrapper.findAll('.stat-card')
    expect(statCards[0]?.find('.stat-value').text()).toBe('5')
  })

  it('formats large amounts correctly', () => {
    const largeAmountLoans: LoanApplication[] = [
      {
        id: '1',
        applicantName: 'Rich Person',
        amount: 1000000,
        termMonths: 120,
        interestRate: 0.05,
        status: 'approved',
        createdAt: '2024-01-15T10:00:00.000Z'
      }
    ]

    const wrapper = mount(LoanSummary, {
      props: { loans: largeAmountLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    expect(statCards[4]?.find('.stat-value').text()).toBe('$1,000,000')
  })

  it('only counts approved loans for total amount', () => {
    const mixedLoans: LoanApplication[] = [
      {
        id: '1',
        applicantName: 'Person 1',
        amount: 50000,
        termMonths: 24,
        interestRate: 0.08,
        status: 'approved',
        createdAt: '2024-01-15T10:00:00.000Z'
      },
      {
        id: '2',
        applicantName: 'Person 2',
        amount: 100000,
        termMonths: 60,
        interestRate: 0.06,
        status: 'pending',
        createdAt: '2024-02-20T14:30:00.000Z'
      },
      {
        id: '3',
        applicantName: 'Person 3',
        amount: 75000,
        termMonths: 36,
        interestRate: 0.07,
        status: 'rejected',
        createdAt: '2024-03-05T11:20:00.000Z'
      }
    ]

    const wrapper = mount(LoanSummary, {
      props: { loans: mixedLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    // Only the first loan is approved with 50000
    expect(statCards[4]?.find('.stat-value').text()).toBe('$50,000')
  })

  it('has correct structure for accessibility', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: mockLoans }
    })

    const statCards = wrapper.findAll('.stat-card')
    statCards.forEach(card => {
      expect(card.find('.stat-value').exists()).toBe(true)
      expect(card.find('.stat-label').exists()).toBe(true)
    })
  })

  it('displays all five statistics labels', () => {
    const wrapper = mount(LoanSummary, {
      props: { loans: [] }
    })

    const labels = wrapper.findAll('.stat-label')
    expect(labels[0]?.text()).toBe('Total Applications')
    expect(labels[1]?.text()).toBe('Pending')
    expect(labels[2]?.text()).toBe('Approved')
    expect(labels[3]?.text()).toBe('Rejected')
    expect(labels[4]?.text()).toBe('Total Approved')
  })
})
