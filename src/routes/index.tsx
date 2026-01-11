import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      to: '/ranking/$type/$date',
      params: {
        type: 'daily',
        date: 'now', // I'll need to handle 'now' in the ranking route or use actual date
      },
    })
  },
})
