import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { nombre, descripcion, empresaId } = await req.json();
    const proyecto = await prisma.proyecto.update({
      where: { id: Number(params.id) },
      data: { nombre: nombre?.trim(), descripcion: descripcion?.trim() || null, empresaId: Number(empresaId) },
      include: { empresa: { select: { id: true, nombre: true, color: true } } },
    });
    return NextResponse.json(proyecto);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.proyecto.delete({ where: { id: Number(params.id) } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
