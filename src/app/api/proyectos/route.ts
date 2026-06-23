import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const empresaId = req.nextUrl.searchParams.get("empresaId");
    const proyectos = await prisma.proyecto.findMany({
      where: empresaId ? { empresaId: Number(empresaId) } : undefined,
      orderBy: { nombre: "asc" },
      include: {
        empresa: { select: { id: true, nombre: true, color: true } },
        _count: { select: { tareas: true } },
      },
    });
    return NextResponse.json(proyectos);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, descripcion, empresaId } = await req.json();
    if (!nombre?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    if (!empresaId) return NextResponse.json({ error: "Empresa requerida" }, { status: 400 });
    const proyecto = await prisma.proyecto.create({
      data: { nombre: nombre.trim(), descripcion: descripcion?.trim() || null, empresaId: Number(empresaId) },
      include: { empresa: { select: { id: true, nombre: true, color: true } } },
    });
    return NextResponse.json(proyecto, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
