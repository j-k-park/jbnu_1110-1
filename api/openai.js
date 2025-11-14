// Vercel 서버리스 함수 (Node.js)
// 이 파일은 /api/openai.js 입니다.

export default async function handler(request, response) {
    // 1. 프론트엔드(index.html)에서 보낸 프롬프트를 추출함.
    const { prompt, systemInstruction } = await request.body;
    
    // 2. Vercel 서버에 저장된 OpenAI API 키를 불러옴.
    //    (Vercel 설정에서 'OPENAI_API_KEY'라는 이름으로 등록해야 함)
    const apiKey = process.env.OPENAI_API_KEY;
    
    const apiUrl = 'https://api.openai.com/v1/chat/completions';

    // 3. OpenAI API payload 구성 (Gemini와 구조가 다름)
    const payload = {
        model: "gpt-4o", // 또는 "gpt-3.5-turbo"
        messages: [
            {
                role: "system",
                content: systemInstruction
            },
            {
                role: "user",
                content: prompt
            }
        ]
    };

    try {
        // 4. OpenAI API를 직접 호출함 (인증 방식이 다름)
        const openAiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}` // 'Bearer' 방식 사용
            },
            body: JSON.stringify(payload),
        });

        if (!openAiResponse.ok) {
            const errorBody = await openAiResponse.text();
            throw new Error(`OpenAI API 오류: ${openAiResponse.status} ${errorBody}`);
        }

        const data = await openAiResponse.json();
        
        // 5. 성공적인 응답을 프론트엔드(index.html)로 다시 전달함.
        //    (Gemini와 응답 구조가 다름)
        response.status(200).json(data);

    } catch (error) {
        console.error("서버리스 함수 오류:", error);
        // 6. 오류 발생 시, 오류 메시지를 프론트엔드(index.html)로 전달함.
        response.status(500).json({ error: error.message });
    }
}
