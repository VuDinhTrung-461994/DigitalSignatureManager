import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Forward request to external OCR API
    const ocrFormData = new FormData();
    ocrFormData.append('file', file);

    const ocrResponse = await fetch('https://ocop-oct.digipro.com.vn/ocr/pdf_or_image', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
      },
      body: ocrFormData,
    });

    if (!ocrResponse.ok) {
      throw new Error(`OCR API error: ${ocrResponse.status}`);
    }

    const ocrData = await ocrResponse.json();
    
    // Extract information
    const text = ocrData.text;
    const result: {name?: string; idNumber?: string} = {};
    
    // Extract ID Number (Số / No.)
    const idMatch = text.match(/Số\s*\/\s*No\.?:\s*(\d+)/i);
    if (idMatch) {
      result.idNumber = idMatch[1];
    }
    
    // Extract Name (Họ và tên / Full name)
    const nameMatch = text.match(/Họ và tên\s*\/\s*Full name:\s*([\w\sÀ-ỹ]+)(?=\n|$)/i);
    if (nameMatch) {
      result.name = nameMatch[1].trim();
    }

    return NextResponse.json({
      success: true,
      data: result,
      rawText: text
    });

  } catch (error: any) {
    console.error('[OCR API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
