export const metadata = {
  title: "Circuito Cero",
  description: "Plataforma educativa de electrónica",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, padding: 0, background: "#ffffff", color: "#0f172a" }}>
        {children}
      </body>
    </html>
  );
}