import { GoogleGenerativeAI } from "@google/generative-ai";

const gemini = async (prompt: any) => {
    try{
        //@ts-ignore
        const gGenAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_AI);
        const model = gGenAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const res = await model.generateContent(prompt)
        return res.response.text()
    }
    catch(error){
        console.log(error)
    }
}

export default gemini