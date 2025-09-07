
// This is the absolute root layout. It's minimal and contains no logic.
// The main layout with all the providers and UI is in `src/app/[locale]/layout.tsx`.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
