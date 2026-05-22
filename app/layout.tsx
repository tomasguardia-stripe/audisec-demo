import type { Metadata } from "next";
import Link from "next/link";
import { StateProvider } from "@/components/state-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo Stripe Billing — GlobalSuite Solutions",
  description: "PoC de Stripe Billing para GlobalSuite Solutions / Audisec",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <nav className="border-b bg-white px-6 py-3 flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg">
            GlobalSuite × Stripe
          </Link>
          <div className="flex gap-4 text-sm text-gray-600">
            <Link href="/setup" className="hover:text-gray-900">Setup</Link>
            <Link href="/contracts/1-enterprise-spain" className="hover:text-gray-900">Contrato 1</Link>
            <Link href="/contracts/2-multitenant-latam" className="hover:text-gray-900">Contrato 2</Link>
            <Link href="/contracts/3-multiyear-ramp" className="hover:text-gray-900">Contrato 3</Link>
            <Link href="/contracts/4-partner-indirect" className="hover:text-gray-900">Contrato 4</Link>
            <Link href="/time" className="hover:text-gray-900">Test Clocks</Link>
            <Link href="/invoices" className="hover:text-gray-900">Cobros</Link>
            <Link href="/portal" className="hover:text-gray-900">Portal</Link>
          </div>
        </nav>
        <StateProvider>
          <main className="flex-1 p-6">{children}</main>
        </StateProvider>
      </body>
    </html>
  );
}
