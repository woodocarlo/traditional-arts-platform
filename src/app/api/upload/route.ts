import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const uploadDir = path.join(process.cwd(), 'public/assets/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('file') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(uploadDir, file.name);
      fs.writeFileSync(filePath, buffer);
    }

    return NextResponse.json({ message: 'Files uploaded successfully' });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
