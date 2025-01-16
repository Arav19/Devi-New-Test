import { AzureOpenAI } from "openai";
import { BirthDetails, GPTMessage } from "@/types";
import { getCurrentPlanetaryPositions } from "./astrology/currentTransits";
import { getCurrentDasha } from "./astrology/currentDasha";
import { systemPrompt } from "./prompts";
//import { getDailyNakshatraReport } from './astrology/dailyNakshatraReport';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Add these global variables at the top of the file
let cachedBirthChart: any = null;
let cachedCurrentPositions: any = null;
let cachedCurrentDasha: any = null;
// let cachedDailyNakshatra: any = null;

// Update the tool definition
// const tools = [
//     {
//         type: "function" as const,
//         function: {
//             name: 'getDailyNakshatraReport',
//             description: 'Get the daily nakshatra prediction for the user based on their birth details if you need to make predictions for the day',
//             parameters: {
//                 type: 'object',
//                 properties: {},
//                 required: []
//             }
//         }
//     }
// ];

// type AvailableFunctions = {
//   [K in 'getDailyNakshatraReport']: (birthDetails: BirthDetails) => Promise<any>;
// };

// // Add the function implementation map
// const availableFunctions : AvailableFunctions = {
//   getDailyNakshatraReport: async (birthDetails: BirthDetails) => {
//     if (!cachedDailyNakshatra) {
//       const result = await getDailyNakshatraReport(birthDetails);
//       cachedDailyNakshatra = result;
//     }
//     return cachedDailyNakshatra;
//   }
// };

// Add this helper function at the top of the file
function cleanResponse(response: string): string {
    return response.replace(/\*/g, '');
}

export async function getAstrologicalReading(
  prompt: string, 
  previousMessages: GPTMessage[] = [],
  userId: string
) {
    try {
        // Fetch user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
            throw new Error('User data not found');
        }

        const userData = userDoc.data();
        const birthDetails: BirthDetails = {
            date: userData.birthDate,
            time: userData.birthTime,
            location: userData.birthPlace
        };

        // console.log('Starting getAstrologicalReading with:', {
        //     previousMessagesCount: previousMessages.length,
        //     hasCachedData: {
        //         birthChart: !!cachedBirthChart,
        //         currentPositions: !!cachedCurrentPositions,
        //         currentDasha: !!cachedCurrentDasha
        //     }
        // });

        const client = new AzureOpenAI({
            apiKey: process.env.AZURE_OPENAI_API_KEY,
            deployment: "gpt-4o",
            apiVersion: "2024-10-21",
            endpoint: process.env.AZURE_OPENAI_ENDPOINT,
        });

        const messages: GPTMessage[] = [
            { 
                role: "system",
                content: `
                    ${systemPrompt}
                    For reference, the current date and time is: ${new Date().toISOString()}
                    Always respond in the following preferred language: ${userData.preferredLanguage}
                `
            }
        ];

        // If this is the first message or we don't have cached data, fetch the data
        if (previousMessages.length === 0 || !cachedBirthChart) {
            // console.log('First message or no cached data, fetching astrological data...');
            
            // Use stored birth chart and fetch only current data
            const [currentPositions, currentDasha] = await Promise.all([
                getCurrentPlanetaryPositions(new Date()),
                getCurrentDasha(birthDetails)
            ]);

            // Cache the data
            cachedBirthChart = userData.birthChart; // Use stored birth chart
            cachedCurrentPositions = currentPositions;
            cachedCurrentDasha = currentDasha;

            // console.log('Astrological data fetched and cached');
        }

        try {
            const userMessage = {
                role: "user" as const,
                content: `
                    User Question to be answered: ${prompt}. Details you may use when relevant to the question: 
                    {
                        Birth Chart Data to Focus On: ${JSON.stringify(cachedBirthChart)}
                        Current Planetary Positions You May Use For Transits Alongside Birth Chart if Needed: ${JSON.stringify(cachedCurrentPositions)}
                        Current Vimshottari Dasha You May Use if Needed: ${JSON.stringify(cachedCurrentDasha)}
                        Current date and time to help with the reading: ${new Date().toISOString()}
                        User Name: ${userData.firstName}
                        User Gender: ${userData.gender}
                        User Relationship Status: ${userData.relationshipStatus}
                        User Occupation: ${userData.occupation}
                    }
                `
            };
            
            const limitedPreviousMessages = previousMessages.slice(-50);
            messages.push(...limitedPreviousMessages, userMessage);

            const completion = await client.chat.completions.create({
                messages: messages as any[],
                model: "gpt-4o",
                // tools: tools,
                // tool_choice: "auto"
            });

            return cleanResponse(completion.choices[0].message.content || '');

        } catch (error: any) {
            // Check if it's a content filter error
            if (error.code === 'content_filter') {
                // console.log('Content filter triggered, retrying with simplified prompt');
                
                // Add a simple "?" message while keeping the conversation history
                const simplifiedUserMessage = {
                    role: "user" as const,
                    content: "?"
                };

                const limitedPreviousMessages = previousMessages.slice(-50);
                messages.push(...limitedPreviousMessages, simplifiedUserMessage);

                const retryCompletion = await client.chat.completions.create({
                    messages: messages as any[],
                    model: "gpt-4o",
                    // tools: tools,
                    // tool_choice: "auto"
                });

                return cleanResponse(retryCompletion.choices[0].message.content || '');
            }
          
            // If it's not a content filter error, rethrow
            throw error;
        } 

        // if (responseMessage.tool_calls) {
        //     console.log('Tool call detected');
        //     const toolCall = responseMessage.tool_calls[0];
        //     const functionName = toolCall.function.name as keyof AvailableFunctions;
        //     const functionResult = await availableFunctions[functionName](birthDetails);
            
        //     // Convert OpenAI message to GPTMessage format
        //     const assistantMessage: GPTMessage = {
        //         role: 'assistant',
        //         content: responseMessage.content || '',
        //         tool_calls: responseMessage.tool_calls
        //     };

        //     // Add the assistant's message and tool response
        //     messages.push(
        //         assistantMessage,
        //         {
        //             role: 'tool',
        //             content: JSON.stringify(functionResult),
        //             tool_call_id: toolCall.id
        //         }
        //     );

        //     // Make a second API call to get the final response
        //     const secondResponse = await client.chat.completions.create({
        //         messages: messages as any[],
        //         model: "gpt-4o",
        //     });

        //     return cleanResponse(secondResponse.choices[0].message.content || '');
        // }

    } catch (error: any) {
        console.error('GPT Service Error:', error);
        throw error;
    }
}
