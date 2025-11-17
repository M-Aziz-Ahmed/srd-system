import { Inter } from 'next/font/google'
import { AuthProvider } from './providers'

import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap', fallback: ['ui-sans-serif', 'system-ui'] })

export const metadata = {
  title: 'SRD Tracking System',
  description: 'Sample Request & Development Tracking System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}