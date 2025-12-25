export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Interview pages should not have any sidebar or dashboard layout
  return <>{children}</>;
}
