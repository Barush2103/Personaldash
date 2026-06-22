import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "0.5rem" }}>Mi App</h1>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>Next.js 14 + Prisma + Supabase + Vercel</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Link
            href="/dashboard"
            style={{
              background: "#000",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            Dashboard →
          </Link>
          <Link
            href="/api/users"
            style={{
              border: "1px solid #ddd",
              color: "#333",
              padding: "10px 20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            API usuarios
          </Link>
        </div>
      </div>
    </main>
  );
}
