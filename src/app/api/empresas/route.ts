import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const empresas = await prisma.empresa.findMany({
      orderBy: { nombre: "asc" },
      include: {
        _count: { select: { proyectos: true, tareas: true } },
      },
    });
    return NextResponse.json(empresas);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { nombre, color } = await req.json();
    if (!nombre?.trim()) return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    const empresa = await prisma.empresa.create({ data: { nombre: nombre.trim(), color: color || "#6366f1" } });
    return NextResponse.json(empresa, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
