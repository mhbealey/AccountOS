import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { ToastProvider } from "@/components/layout/Toast";

export const metadata: Metadata = {
  title: "AccountOS",
  description:
    "Production-grade account management for freelancers and agencies. Manage clients, invoices, contracts, time tracking, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased"
    >
      <body className="min-h-full bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg"
        >
          Skip to content
        </a>
        <ErrorBoundary>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
