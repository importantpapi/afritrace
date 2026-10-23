export const metadata = {
  title: "Afritrace",
  description: "AI-native evidence packs for Africa→EU trade",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f4f4f5", color: "#0a0a0b" }}>{children}</body>
    </html>
  );
}
