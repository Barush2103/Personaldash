import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prioridad, Estatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const empresaId = sp.get("empresaId");
    const proyectoId = sp.get("proyectoId");
    const estatus = sp.get("estatus") as Estatus | null;

    const tareas = await prisma.tarea.findMany({
      where: {
        ...(empresaId ? { empresaId: Number(empresaId) } : {}),
        ...(proyectoId ? { proyectoId: Number(proyectoId) } : {}),
        ...(estatus ? { estatus } : {}),
      },
      orderBy: [{ prioridad: "asc" }, { fechaLimite: "asc" }],
      include: {
        empresa: { select: { id: true, nombre: true, color: true } },
        proyecto: { select: { id: true, nombre: true } },
      },
    });
    return NextResponse.json(tareas);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { titulo, descripcion, prioridad, estatus, fechaLimite, tiempoEstimado, solicitante, empresaId, proyectoId } = body;

    if (!titulo?.trim()) return NextResponse.json({ error: "Título requerido" }, { status: 400 });
    if (!empresaId) return NextResponse.json({ error: "Empresa requerida" }, { status: 400 });

    const tarea = await prisma.tarea.create({
      data: {
        titulo: titulo.trim(),
        descripcion: descripcion?.trim() || null,
        prioridad: (prioridad as Prioridad) || "MEDIA",
        estatus: (estatus as Estatus) || "PENDIENTE",
        fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
        tiempoEstimado: tiempoEstimado ? Number(tiempoEstimado) : null,
        solicitante: solicitante?.trim() || null,
        empresaId: Number(empresaId),
        proyectoId: proyectoId ? Number(proyectoId) : null,
      },
      include: {
        empresa: { select: { id: true, nombre: true, color: true } },
        proyecto: { select: { id: true, nombre: true } },
      },
    });
    return NextResponse.json(tarea, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
