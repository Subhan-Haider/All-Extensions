import { NextRequest, NextResponse } from 'next/server';
import { analyzeExtension } from '@/lib/analyzer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GOOGLE_GENERATIVE_AI_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY) : null;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const report = await analyzeExtension(buffer);

        // AI Enhancement (Optional)
        if (genAI) {
            try {
                const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                const prompt = `
          Analyze this browser extension report and provide 3-5 high-level strategic recommendations for store submission (Chrome, Firefox, Edge).
          Extension Name: ${report.extensionName}
          Manifest Version: ${report.manifestVersion}
          Results: ${JSON.stringify(report.results.filter(r => r.status !== 'passed'))}
          
          Provide the response as a JSON array of strings under the key "recommendations".
        `;

                const aiResult = await model.generateContent(prompt);
                const aiText = aiResult.response.text();
                const jsonMatch = aiText.match(/\{.*\}/s);
                if (jsonMatch) {
                    const aiJson = JSON.parse(jsonMatch[0]);
                    if (aiJson.recommendations) {
                        report.readiness.recommendations.push(...aiJson.recommendations);
                    }
                }
            } catch (aiError) {
                console.error('AI Enhancement failed:', aiError);
            }
        }

        return NextResponse.json(report);
    } catch (error: any) {
        console.error('Analysis error:', error);
        return NextResponse.json({ error: 'Internal server error during analysis' }, { status: 500 });
    }
}
