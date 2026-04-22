import { SirhProvider } from '@/contexts/SirhContext'

export default function SirhLayout({ children }: { children: React.ReactNode }) {
  return <SirhProvider>{children}</SirhProvider>
}
