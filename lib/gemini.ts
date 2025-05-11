import { GoogleGenerativeAI } from "@google/generative-ai"

if (!process.env.GOOGLE_AI_API_KEY) {
    throw new Error("Missing GOOGLE_AI_API_KEY environment variable")
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY)

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

// System prompt to guide the AI's responses
export const SYSTEM_PROMPT = `Bạn là trợ lý AI của Finto Pet Food - một cửa hàng thức ăn thú cưng chất lượng cao.
Hãy trả lời các câu hỏi của khách hàng một cách thân thiện và chuyên nghiệp.
Tập trung vào các chủ đề:
- Thức ăn cho chó và mèo
- Dinh dưỡng cho thú cưng
- Chăm sóc thú cưng
- Sản phẩm của cửa hàng
- Chính sách vận chuyển và thanh toán

Nếu không biết câu trả lời, hãy thành thật thừa nhận và đề nghị khách hàng liên hệ với nhân viên tư vấn.` 