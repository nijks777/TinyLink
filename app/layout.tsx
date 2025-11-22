'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition cursor-pointer">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    TinyLink
                  </h1>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <NavLink href="/" isActive={pathname === "/"}>Dashboard</NavLink>
                    <NavLink href="/links" isActive={pathname === "/links"}>Links</NavLink>
                  </div>

                  {/* User Info */}
                  <div className="border-l border-gray-300 pl-4 text-right">
                    <p className="text-sm font-semibold text-gray-900">Jalaj Sharma</p>
                    <p className="text-xs text-gray-600">+917007752950</p>
                    <p className="text-xs text-gray-500">Naukri1125</p>
                  </div>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

function NavLink({ href, children, isActive }: { href: string; children: React.ReactNode; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
        isActive
          ? 'bg-orange-100 text-orange-700'
          : 'text-gray-700 hover:text-orange-600 hover:bg-orange-50'
      }`}
    >
      {children}
    </Link>
  );
}
