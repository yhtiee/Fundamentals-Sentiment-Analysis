"use client"
import React, { useState, useEffect, useMemo } from 'react';

// Define the type for a currency pair's data
interface CurrencyData {
  pair: string;
  sentiment: 'Very Bullish' | 'Bullish' | 'Neutral' | 'Bearish' | 'Very Bearish';
  description: string;
  details: string; // Made required as per schema
  fundamentalDrivers: string[]; // Made required as per schema
  sentimentIndicators: string[]; // Made required as per schema
}

// Helper function to determine Tailwind CSS color class based on sentiment
const getSentimentColorClass = (sentiment: CurrencyData['sentiment']): string => {
  switch (sentiment) {
    case 'Very Bullish':
      return 'bg-green-600'; // Darker green for very strong positive
    case 'Bullish':
      return 'bg-lime-500';  // Lighter green for positive
    case 'Neutral':
      return 'bg-yellow-400'; // Yellow for neutral
    case 'Bearish':
      return 'bg-orange-500'; // Orange for negative
    case 'Very Bearish':
      return 'bg-red-600';    // Darker red for very strong negative
    default:
      return 'bg-gray-400'; // Default for unknown sentiment
  }
};

// Define the order for sorting sentiments
const sentimentOrder: Record<CurrencyData['sentiment'], number> = {
  'Very Bullish': 0,
  'Bullish': 1,
  'Neutral': 2,
  'Bearish': 3,
  'Very Bearish': 4,
};

// Currency Detail Page Component
const CurrencyDetailPage: React.FC<{ pairData: CurrencyData; onBack: () => void }> = ({ pairData, onBack }) => (
  <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-8 animate-fade-in">
    <button
      onClick={onBack}
      className="mb-6 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors duration-200 flex items-center"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
      Back to List
    </button>

    <h2 className="text-3xl font-bold text-gray-900 mb-4">{pairData.pair} - Detailed Analysis</h2>
    <div className="flex items-center mb-6">
      <span
        className={`px-4 py-2 rounded-full text-lg font-semibold text-white ${getSentimentColorClass(pairData.sentiment).replace('bg-', 'bg-opacity-90 bg-')}`}
      >
        {pairData.sentiment}
      </span>
    </div>

    <p className="text-gray-700 mb-6 leading-relaxed">{pairData.details}</p>

    {pairData.fundamentalDrivers && pairData.fundamentalDrivers.length > 0 && (
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Key Fundamental Drivers:</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          {pairData.fundamentalDrivers.map((driver, idx) => (
            <li key={idx}>{driver}</li>
          ))}
        </ul>
      </div>
    )}

    {pairData.sentimentIndicators && pairData.sentimentIndicators.length > 0 && (
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">Relevant Sentiment Indicators:</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          {pairData.sentimentIndicators.map((indicator, idx) => (
            <li key={idx}>{indicator}</li>
          ))}
        </ul>
      </div>
    )}

    <p className="text-gray-500 text-sm italic mt-8">
      Analysis provided by Gemini AI. While comprehensive, always cross-reference with other sources for trading decisions.
    </p>
  </div>
);


// Main App component (can be your page.tsx content)
const App: React.FC = () => {
  const [selectedPair, setSelectedPair] = useState<CurrencyData | null>(null);
  const [currencyPairsData, setCurrencyPairsData] = useState<CurrencyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get current date for analysis prompt
  const today = new Date();
  const analysisDate = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useEffect(() => {
    const fetchCurrencyAnalysis = async () => {
      setLoading(true);
      setError(null);
      const chatHistory = [];
      const prompt = `As a senior forex analyst specializing in swing trading, provide a comprehensive sentiment and fundamental analysis for each of the following currency pairs as of today, ${analysisDate}. For each pair, perform a detailed analysis considering:
      - Global Macroeconomic Environment: Current state of major economies (US, Eurozone, UK, Japan, Canada, Australia, New Zealand, Switzerland), including recent GDP, inflation (CPI/PCE), employment data (NFP, jobless claims), and interest rate outlooks.
      - Central Bank Monetary Policy: Recent decisions, forward guidance, and projected policy paths from the Federal Reserve, European Central Bank, Bank of England, Bank of Japan, Bank of Canada, Reserve Bank of Australia, Reserve Bank of New Zealand, and Swiss National Bank, highlighting any divergences.
      - Geopolitical & Trade Factors: Significant geopolitical events, trade tensions, and their potential impact on global capital flows and specific currencies.
      - Intermarket Correlations: How movements in commodities (e.g., oil for CAD, gold for AUD/NZD, other metals), bond yields, and major stock indices might influence the currency pairs.
      - Sentiment & Positioning: Major market sentiment indicators, speculative positioning (e.g., COT data, retail sentiment surveys), significant news headlines, and market liquidity conditions.

      Based on this holistic view, for each currency pair, provide:
      1.  'pair': The currency pair ticker.
      2.  'sentiment': Categorize the overall bias as 'Very Bullish', 'Bullish', 'Neutral', 'Bearish', or 'Very Bearish'.
      3.  'description': A concise summary (1-2 sentences) of the primary driver(s) for the sentiment.
      4.  'details': A more elaborate paragraph (4-6 sentences) explaining the key fundamental and sentiment factors contributing to the bias, including any short-term risks or catalysts.
      5.  'fundamentalDrivers': A comprehensive list of specific macroeconomic, monetary policy, and geopolitical factors driving the pair.
      6.  'sentimentIndicators': A list of observable market sentiment indicators or flows relevant to the pair's bias.

      Ensure the analysis is nuanced, well-reasoned, and specifically tailored for swing trading opportunities. The output MUST be a JSON array of objects, with all fields populated for every specified currency pair.
      Currency Pairs: EURUSD, GBPUSD, USDJPY, USDCHF, AUDUSD, USDCAD, NZDUSD, XAUUSD, BTCUSD, EURJPY, EURGBP, NZDJPY, GBPJPY, GBPCHF, GBPCAD, AUDJPY, CHFJPY, NZDCAD, CADJPY.
      Provide the output as a JSON array of objects, ensuring all specified fields are populated.`;

      chatHistory.push({ role: "user", parts: [{ text: prompt }] });

      const payload = {
        contents: chatHistory,
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                "pair": { "type": "STRING" },
                "sentiment": {
                  "type": "STRING",
                  "enum": ["Very Bullish", "Bullish", "Neutral", "Bearish", "Very Bearish"]
                },
                "description": { "type": "STRING" },
                "details": { "type": "STRING" },
                "fundamentalDrivers": {
                  "type": "ARRAY",
                  "items": { "type": "STRING" }
                },
                "sentimentIndicators": {
                  "type": "ARRAY",
                  "items": { "type": "STRING" }
                }
              },
              "required": ["pair", "sentiment", "description", "details", "fundamentalDrivers", "sentimentIndicators"]
            }
          }
        }
      };

      const apiUrl = `api/trading-data`;

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        console.log(result)

        if (result) {
          const parsedData: CurrencyData[] = JSON.parse(result.result);
          setCurrencyPairsData(parsedData);
        } else {
          setError('Unexpected API response structure.');
        }
      } catch (err) {
        console.error("Failed to fetch currency analysis:", err);
        setError(`Failed to load analysis: ${err || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencyAnalysis();
  }, [analysisDate]); // Re-fetch if analysisDate changes (though it's fixed to today's date here)

  // Sort the data based on the defined sentiment order
  const sortedCurrencyPairsData = useMemo(() => {
    return [...currencyPairsData].sort((a, b) => {
      return sentimentOrder[a.sentiment] - sentimentOrder[b.sentiment];
    });
  }, [currencyPairsData]);


  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center tracking-tight">
        Currency Sentiment & Fundamental Analysis
      </h1>
      <p className="text-lg text-gray-700 mb-4 text-center max-w-2xl">
        This dashboard provides a snapshot of major currency pairs`&apos;` sentiment and fundamental bias,
        color-coded for quick interpretation.
      </p>
      <div className="mb-12 text-center text-gray-600 font-semibold text-xl p-3 bg-white rounded-lg shadow-sm">
        Analysis Date: <span className="text-blue-700">{analysisDate}</span>
      </div>


      {selectedPair ? (
        // Render detail page if a pair is selected
        <CurrencyDetailPage pairData={selectedPair} onBack={() => setSelectedPair(null)} />
      ) : (
        // Render main list if no pair is selected
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl overflow-hidden animate-fade-in">
          {loading ? (
            <div className="p-6 text-center text-blue-600 text-lg">
              <svg className="animate-spin h-5 w-5 mr-3 inline-block" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading analysis...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-600 text-lg">
              Error loading data: {error}
            </div>
          ) : sortedCurrencyPairsData.length > 0 ? (
            <>
              {/* Table Header */}
              <div className="flex items-center bg-gray-200 px-6 py-4 font-semibold text-gray-700 border-b border-gray-300 rounded-t-xl">
                <div className="w-1/4 text-left">Currency Pair</div>
                <div className="w-1/4 text-center">Bias</div>
                <div className="w-1/2 text-left">Description</div>
              </div>

              {/* Table Rows */}
              {sortedCurrencyPairsData.map((data, index) => {
                const sentimentColorClass = getSentimentColorClass(data.sentiment);
                return (
                  <div
                    key={index}
                    className="flex items-center px-6 py-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    onClick={() => setSelectedPair(data)} // Set selectedPair on row click
                  >
                    {/* Currency Pair Column */}
                    <div className="w-1/4 text-lg font-medium text-gray-800">
                      {data.pair}
                    </div>

                    {/* Bias Column (with color code) */}
                    <div className="w-1/4 flex justify-center items-center">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium text-white ${sentimentColorClass.replace('bg-', 'bg-opacity-80 bg-')}`}
                      >
                        {data.sentiment}
                      </span>
                    </div>

                    {/* Description Column */}
                    <div className="w-1/2 text-gray-600 text-sm">
                      {data.description}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No currency pairs analysis available.
            </div>
          )}
        </div>
      )}

      <footer className="mt-16 text-center text-gray-500 text-sm">
        <p>&copy; 2025 Currency Analysis. All rights reserved. Data is for illustrative purposes only.</p>
        <p>Analysis provided by Gemini AI. Market conditions can change rapidly.</p>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
          }
        `}</style>
      </footer>
    </div>
  );
};

export default App;
