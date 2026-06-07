import "./globals.css";

export const metadata = {
  title: "Circuit Labs — Finance Dashboard",
  description: "Unified financial dashboard for Circuit Labs Inc.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
