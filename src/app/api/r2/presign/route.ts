import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2';

export async function POST(request: NextRequest) {
  // 1. Validar autenticación en el servidor usando el token del header
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@admin.com';

  if (!user.email || user.email !== adminEmail) {
    return NextResponse.json({ error: 'Prohibido: solo el administrador puede subir archivos' }, { status: 403 });
  }

  try {
    const { filename, contentType, folder } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json({ error: 'Faltan parámetros: filename y contentType son obligatorios' }, { status: 400 });
    }

    // Generar la ruta/key única en R2
    // Se recomienda limpiar el filename y anteponer un timestamp único
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFilename = `${Date.now()}-${cleanFilename}`;
    const key = folder ? `${folder}/${uniqueFilename}` : uniqueFilename;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    // Generar la URL de carga (vencimiento de 1 hora)
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    
    // URL pública final para guardar en la base de datos
    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (err: any) {
    console.error('Error generando presigned URL:', err);
    return NextResponse.json({ error: 'Error al generar la URL de carga firmada' }, { status: 500 });
  }
}
