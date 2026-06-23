import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prioridad, Estatus } from "@prisma/client";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { titulo, descripcion, prioridad, estatus, fechaLimite, tiempoEstimado, solicitante, empresaId, proyectoId } = body;

    const tarea = await prisma.tarea.update({
      where: { id: Number(params.id) },
      data: {
        titulo: titulo?.trim(),
        descripcion: descripcion?.trim() || null,
        prioridad: prioridad as Prioridad,
        estatus: estatus as Estatus,
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
    return NextResponse.json(tarea);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.tarea.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
