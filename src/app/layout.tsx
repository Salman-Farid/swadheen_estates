import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthSessionProvider } from '@/components/providers/session-provider'
import { ToastProvider } from '@/components/providers/toast-provider'
import { WishlistProvider } from '@/features/wishlist/wishlist-provider'
import { RegisterServiceWorker } from '@/components/pwa/register-sw'
import { MotionProvider } from '@/experience/motion/motion-provider'
import { MotionTuningPanel } from '@/experience/motion/motion-tuning-panel'
import { LocaleProvider } from '@/i18n/locale-provider'
import { env } from '@/lib/env'

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: { default: 'স্বাধীন এস্টেটস — জায়গার অনুভূতির বাড়ি', template: '%s · স্বাধীন এস্টেটস' },
  description:
    'ঢাকায় নির্বাচিত জমি, বাড়ি এবং ফ্ল্যাট। পরিষ্কার তথ্য, সত্যিকারের মানুষ ও গোছানো বাড়ি।',
  applicationName: 'স্বাধীন এস্টেটস',
  keywords: ['ঢাকার রিয়েল এস্টেট', 'ঢাকায় ফ্ল্যাট', 'জমি বিক্রি', 'বাংলাদেশে বাড়ি'],
  openGraph: {
    type: 'website',
    siteName: 'স্বাধীন এস্টেটস',
    title: 'জায়গার অনুভূতির বাড়ি',
    description: 'যত্ন নিয়ে নির্বাচিত জমি, বাড়ি এবং ফ্ল্যাট।',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light dark',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <MotionProvider>
            <LocaleProvider>
              <AuthSessionProvider>
                <ToastProvider>
                  <WishlistProvider>
                    <RegisterServiceWorker />
                    {children}
                    {process.env.NODE_ENV === 'development' &&
                      process.env.NEXT_PUBLIC_ENABLE_MOTION_TUNING === 'true' && <MotionTuningPanel />}
                  </WishlistProvider>
                </ToastProvider>
              </AuthSessionProvider>
            </LocaleProvider>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

