// Vercel 서버리스 함수 (Node.js)
// 이 파일은 프로젝트 루트의 'api' 폴더 안에 위치해야 합니다. (예: /api/gemini.js)

export default async function handler(request, response) {
    // 1. 프론트엔드(index.html)에서 보낸 요청 본문(body)에서 프롬프트를 추출함.
    const { prompt, systemInstruction } = await request.body;
    
    // 2. Vercel 서버에 안전하게 저장된 환경 변수에서 API 키를 불러옴.
    //    이 키는 절대로 외부에 노출되지 않음.
    const apiKey = process.env.GEMINI_API_KEY;
    
    // 3. 모델 이름을 유효한 모델명으로 수정함 (기존 09-2025 -> 05-20)
    const model = 'gemini-2.5-flash-preview-05-20';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // 4. Google API로 보낼 payload를 구성함.
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
    };
    
    if (systemInstruction) {
        payload.systemInstruction = {
            parts: [{ text: systemInstruction }]
        };
    }

    try {
        // 5. Vercel 서버가 Google Gemini API를 직접 호출함.
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.text();
            throw new Error(`Google API 오류: ${geminiResponse.status} ${errorBody}`);
        }

        const data = await geminiResponse.json();

        // 6. 성공적인 응답을 프론트엔드(index.html)로 다시 전달함.
        response.status(200).json(data);

    } catch (error) {
        console.error("서버리스 함수 오류:", error);
        // 7. 오류 발생 시, 오류 메시지를 프론트엔드(index.html)로 전달함.
        response.status(500).json({ error: error.message });
    }
}
