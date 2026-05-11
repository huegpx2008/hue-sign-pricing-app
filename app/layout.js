export const metadata = {
  title: "Hue Sign Pricing App v2",
  description: "Sign pricing calculator for Hue Graphics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'Arial, Helvetica, "Segoe UI", Verdana, sans-serif' }}>{children}</body>
    </html>
  );
}
