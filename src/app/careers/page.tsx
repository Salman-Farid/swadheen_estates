import type { Metadata } from 'next'
import { CareersContent } from './careers-content'

export const metadata: Metadata = { title: 'ক্যারিয়ার' }

export default function CareersPage() {
  return <CareersContent />
}
