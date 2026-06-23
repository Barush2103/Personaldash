import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personaldash",
  description: "Sistema de gestión de tareas y proyectos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <style>{`
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          :root {
            --bg: #f8f8f7;
            --surface: #ffffff;
            --border: #e5e5e3;
            --border-light: #f0f0ef;
            --text: #1a1a18;
            --text-2: #6b6b68;
            --text-3: #9b9b98;
            --accent: #18181b;
            --radius: 10px;
            --radius-sm: 6px;
            --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
            --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: var(--bg);
            color: var(--text);
            font-size: 14px;
            line-height: 1.5;
            min-height: 100vh;
          }
          button { cursor: pointer; font-family: inherit; }
          input, select, textarea { font-family: inherit; }
          a { text-decoration: none; color: inherit; }
          * { -webkit-font-smoothing: antialiased; }
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
