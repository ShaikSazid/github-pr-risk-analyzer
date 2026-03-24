import { Header } from './Header'
import { Footer } from './Footer'

export function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-12">
        {children}
      </main>
      <Footer />
    </div>
  )
}