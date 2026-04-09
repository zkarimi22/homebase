export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Login page has no sidebar — just the centered form
  return <>{children}</>;
}
