import type { EntityFormConfig, EntityFormField } from './useEntityForm'
import type { Contact } from '../types/Contact'
import type { Company } from '../types/Company'
import type { Task } from '../types/Task'
import type { Note } from '../types/Note'
import type { Opportunity } from '../types/Opportunity'
import type { FormFieldStore } from '../types/Store'
import { useValidation } from './useValidation'
import { useCompanyStore } from '../stores/companies'
import { useContactStore } from '../stores/contacts'

const { rules } = useValidation()

// Company Form Configuration
export function useCompanyFormConfig(): EntityFormConfig<Company> {
  return {
    entityName: 'Company',
    entityIcon: 'mdi-office-building',
    entityColor: 'info',
    sections: [
      {
        title: 'Basic Information',
        icon: 'mdi-office-building',
        color: 'info',
        fields: [
          {
            key: 'name',
            type: 'text',
            label: 'Company Name',
            required: true,
            rules: [rules.required],
            icon: 'mdi-office-building'
          },
          {
            key: 'description',
            type: 'textarea',
            label: 'Description',
            icon: 'mdi-text',
            rows: 3
          }
        ]
      },
      {
        title: 'Contact Information',
        icon: 'mdi-contact-phone',
        color: 'success',
        fields: [
          {
            key: 'phone',
            type: 'tel',
            label: 'Phone Number',
            icon: 'mdi-phone',
            rules: [rules.phone]
          },
          {
            key: 'website',
            type: 'url',
            label: 'Website',
            icon: 'mdi-web',
            rules: [rules.url]
          },
          {
            key: 'address',
            type: 'text',
            label: 'Address',
            icon: 'mdi-map-marker'
          }
        ]
      }
    ]
  }
}

// Contact Form Configuration
export function useContactFormConfig(): EntityFormConfig<Contact> {
  const companyStore = useCompanyStore()
  
  return {
    entityName: 'Contact',
    entityIcon: 'mdi-account',
    entityColor: 'primary',
    sections: [
      {
        title: 'Personal Information',
        icon: 'mdi-account',
        color: 'primary',
        fields: [
          {
            key: 'firstname',
            type: 'text',
            label: 'First Name',
            required: true,
            rules: [rules.required],
            icon: 'mdi-account'
          },
          {
            key: 'lastname',
            type: 'text',
            label: 'Last Name',
            required: true,
            rules: [rules.required],
            icon: 'mdi-account'
          }
        ]
      },
      {
        title: 'Contact Information',
        icon: 'mdi-email',
        color: 'success',
        fields: [
          {
            key: 'email',
            type: 'email',
            label: 'Email Address',
            rules: [rules.email],
            icon: 'mdi-email'
          },
          {
            key: 'phone',
            type: 'tel',
            label: 'Phone Number',
            icon: 'mdi-phone',
            rules: [rules.phone]
          }
        ]
      },
      {
        title: 'Company Information',
        icon: 'mdi-office-building',
        color: 'info',
        fields: [
          {
            key: 'company',
            type: 'select',
            label: 'Company',
            icon: 'mdi-office-building',
            clearable: true,
            relationship: {
              store: companyStore as unknown as FormFieldStore,
              displayField: (item: Record<string, unknown>) => {
                const company = item as Company & { title?: string }
                // Support both name and title for compatibility with existing modals
                return company.title || company.name || `Company #${company.id}`
              },
              valueField: 'id'
            }
          }
        ]
      }
    ]
  }
}

// Task Form Configuration  
export function useTaskFormConfig(): EntityFormConfig<Task> {
  const contactStore = useContactStore()
  
  return {
    entityName: 'Task',
    entityIcon: 'mdi-checkbox-marked-circle',
    entityColor: 'warning',
    sections: [
      {
        title: 'Task Details',
        icon: 'mdi-checkbox-marked-circle',
        color: 'warning',
        fields: [
          {
            key: 'description',
            type: 'textarea',
            label: 'Description',
            required: true,
            rules: [rules.required],
            icon: 'mdi-text',
            rows: 3
          }
        ]
      },
      {
        title: 'Scheduling & Status',
        icon: 'mdi-calendar-clock',
        color: 'info',
        fields: [
          {
            key: 'dueDate',
            type: 'date',
            label: 'Due Date',
            required: true,
            rules: [rules.required],
            icon: 'mdi-calendar'
          },
          {
            key: 'status',
            type: 'select',
            label: 'Status',
            required: true,
            rules: [rules.required],
            icon: 'mdi-flag',
            options: [
              { label: 'Pending', value: 'pending' },
              { label: 'Done', value: 'done' },
              { label: 'Cancelled', value: 'cancelled' }
            ]
          }
        ]
      },
      {
        title: 'Contact Information',
        icon: 'mdi-account',
        color: 'primary',
        fields: [
          {
            key: 'contact',
            type: 'select',
            label: 'Contact',
            icon: 'mdi-account',
            clearable: true,
            relationship: {
              store: contactStore as unknown as FormFieldStore,
              displayField: (item: Record<string, unknown>) => {
                const contact = item as Contact
                const firstName = contact.firstname?.trim() || ''
                const lastName = contact.lastname?.trim() || ''
                const fullName = `${firstName} ${lastName}`.trim()
                
                if (fullName) return fullName
                if (contact.email?.trim()) return contact.email.trim()
                return `Contact #${contact.id || 'Unknown'}`
              }
            }
          }
        ]
      }
    ]
  }
}

// Note Form Configuration
export function useNoteFormConfig(): EntityFormConfig<Note> {
  const contactStore = useContactStore()
  
  return {
    entityName: 'Note',
    entityIcon: 'mdi-note-text',
    entityColor: 'secondary',
    sections: [
      {
        title: 'Note Details',
        icon: 'mdi-note-text',
        color: 'secondary',
        fields: [
          {
            key: 'name',
            type: 'text',
            label: 'Name',
            required: true,
            rules: [rules.required],
            icon: 'mdi-format-title'
          },
          {
            key: 'content',
            type: 'textarea',
            label: 'Content',
            required: true,
            rules: [rules.required],
            icon: 'mdi-text',
            rows: 5
          }
        ]
      },
      {
        title: 'Contact Information',
        icon: 'mdi-account',
        color: 'primary',
        fields: [
          {
            key: 'contact',
            type: 'select',
            label: 'Contact',
            icon: 'mdi-account',
            clearable: true,
            relationship: {
              store: contactStore as unknown as FormFieldStore,
              displayField: (item: Record<string, unknown>) => {
                const contact = item as Contact
                const firstName = contact.firstname?.trim() || ''
                const lastName = contact.lastname?.trim() || ''
                const fullName = `${firstName} ${lastName}`.trim()
                
                if (fullName) return fullName
                if (contact.email?.trim()) return contact.email.trim()
                return `Contact #${contact.id || 'Unknown'}`
              }
            }
          }
        ]
      }
    ]
  }
}

// Opportunity Form Configuration
export function useOpportunityFormConfig(): EntityFormConfig<Opportunity> {
  const contactStore = useContactStore()
  
  return {
    entityName: 'Opportunity',
    entityIcon: 'mdi-chart-line',
    entityColor: 'success',
    sections: [
      {
        title: 'Opportunity Details',
        icon: 'mdi-chart-line',
        color: 'success',
        fields: [
          {
            key: 'title',
            type: 'text',
            label: 'Title',
            required: true,
            rules: [rules.required],
            icon: 'mdi-format-title'
          },
          {
            key: 'description',
            type: 'textarea',
            label: 'Description',
            icon: 'mdi-text',
            rows: 3
          }
        ]
      },
      {
        title: 'Financial Information',
        icon: 'mdi-currency-usd',
        color: 'warning',
        fields: [
          {
            key: 'amount',
            type: 'text',
            label: 'Amount',
            required: true,
            rules: [rules.required],
            icon: 'mdi-currency-usd'
          },
          {
            key: 'status',
            type: 'select',
            label: 'Status',
            required: true,
            rules: [rules.required],
            icon: 'mdi-flag',
            options: [
              { label: 'Prospect', value: 'prospect' },
              { label: 'Qualified', value: 'qualified' },
              { label: 'Won', value: 'won' },
              { label: 'Lost', value: 'lost' }
            ]
          }
        ]
      },
      {
        title: 'Schedule',
        icon: 'mdi-calendar',
        color: 'info',
        fields: [
          {
            key: 'closeDate',
            type: 'date',
            label: 'Close Date',
            icon: 'mdi-calendar',
            rules: [rules.futureDate]
          }
        ]
      },
      {
        title: 'Contact Information',
        icon: 'mdi-account',
        color: 'primary',
        fields: [
          {
            key: 'contact',
            type: 'select',
            label: 'Contact',
            icon: 'mdi-account',
            clearable: true,
            relationship: {
              store: contactStore as unknown as FormFieldStore,
              displayField: (item: Record<string, unknown>) => {
                const contact = item as Contact
                const firstName = contact.firstname?.trim() || ''
                const lastName = contact.lastname?.trim() || ''
                const fullName = `${firstName} ${lastName}`.trim()
                
                if (fullName) return fullName
                if (contact.email?.trim()) return contact.email.trim()
                return `Contact #${contact.id || 'Unknown'}`
              }
            }
          }
        ]
      }
    ]
  }
}