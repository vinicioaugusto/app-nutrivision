import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'URL da imagem é obrigatória' },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analise a imagem e liste todos os alimentos que aparecem.
Estime o peso aproximado em gramas de cada item.
Calcule calorias totais e a distribuição de macronutrientes para cada alimento e para a refeição completa.
Retorne APENAS um JSON válido no formato:
{
  "itens": [
    {
      "alimento": "nome do alimento",
      "quantidade_g": 150,
      "calorias": 280,
      "macros": { "proteina": 45, "carboidrato": 0, "gordura": 8 }
    }
  ],
  "total": {
    "calorias": 560,
    "proteina": 48,
    "carboidrato": 42,
    "gordura": 14
  }
}`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    const analysis = JSON.parse(content);

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro ao analisar refeição:', error);
    return NextResponse.json(
      { error: 'Erro ao analisar a imagem' },
      { status: 500 }
    );
  }
}
