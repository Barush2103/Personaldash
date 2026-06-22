import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  let users: { id: number; email: string; name: string | null; createdAt: Date }[] = [];
  let dbError = false;

  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });
  } catch {
    dbError = true;
  }

  return (
    <main style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Dashboard</h1>
        <Link href="/" style={{ fontSize: "13px", color: "#666", textDecoration: "none" }}>← Inicio</Link>
      </div>

      {dbError ? (
        <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: "8px", padding: "1rem", color: "#856404" }}>
          No se pudo conectar a la base de datos. Verifica tu <code>DATABASE_URL</code>.
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e5e5", overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 500 }}>Usuarios ({users.length})</span>
          </div>
          {users.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#888", fontSize: "14px" }}>
              No hay usuarios aún. Usa <code>POST /api/users</code> para crear uno.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ fontSize: "12px", color: "#888", textAlign: "left" }}>
                  <th style={{ padding: "10px 16px", fontWeight: 500 }}>ID</th>
                  <th style={{ padding: "10px 16px", fontWeight: 500 }}>Email</th>
                  <th style={{ padding: "10px 16px", fontWeight: 500 }}>Nombre</th>
                  <th style={{ padding: "10px 16px", fontWeight: 500 }}>Creado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderTop: "1px solid #f0f0f0", fontSize: "14px" }}>
                    <td style={{ padding: "12px 16px", color: "#888" }}>{u.id}</td>
                    <td style={{ padding: "12px 16px" }}>{u.email}</td>
                    <td style={{ padding: "12px 16px", color: "#666" }}>{u.name ?? "—"}</td>
                    <td style={{ padding: "12px 16px", color: "#888" }}>{new Date(u.createdAt).toLocaleDateString("es-MX")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </main>
  );
}
