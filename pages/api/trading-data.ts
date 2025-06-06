import gemini from '@/utils/geminiAI';
import { NextApiRequest, NextApiResponse } from 'next';

interface TradingDataRequest extends NextApiRequest {
    // Add custom properties here if needed
}

interface TradingDataResponse extends NextApiResponse {
    // Add custom properties here if needed
}

export default async function handler(
    req: TradingDataRequest,
    res: TradingDataResponse
) {
    const method = req.method?.toLowerCase()
    try{
        if(method === "post"){
            console.log(req.body)
            const result = await gemini(req.body)
            return res.status(200).json({
                result
            })
        }
        return res.status(400).json({
            message: "Method not allowed"
        })
    }
    catch(error){
        console.log(error, "Error while getting trading data")
        return res.status(400).json({
            message: error
        })
    }
}