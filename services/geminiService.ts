import { GoogleGenAI } from "@google/genai";
import { Client, Equipment } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize client safely (it might fail if key is missing, handled in call)
const ai = new GoogleGenAI({ apiKey });

export const generateAssistantResponse = async (
  prompt: string,
  contextData: { clients: Client[], currentView: string }
): Promise<string> => {
  if (!apiKey) {
    return "API Key não configurada. Por favor configure a variável de ambiente API_KEY.";
  }

  try {
    // Prepare a lightweight context summary
    const dataSummary = contextData.clients.map(c => ({
      name: c.name,
      contact: c.contactPerson,
      equipments: c.equipments.map(e => ({
        local: e.location,
        model: e.productName,
        serial: e.equipmentSerial,
        paid: e.contract?.isPaid ? 'Sim' : 'Não',
        visitsLeftLight: (e.contract?.totalLightVisits || 0) - (e.contract?.usedLightVisits || 0),
        visitsLeftTruck: (e.contract?.totalTruckVisits || 0) - (e.contract?.usedTruckVisits || 0),
      }))
    }));

    const systemInstruction = `
      És um assistente inteligente para uma aplicação de gestão de manutenção de básculas.
      O teu objetivo é ajudar o técnico ou gestor a encontrar informações, resumir contratos ou sugerir ações.
      Responde sempre em Português de Portugal.
      Sê conciso e profissional.
      
      Dados Atuais do Sistema (Resumo JSON):
      ${JSON.stringify(dataSummary)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 0 } // Fast response for UI chat
      }
    });

    return response.text || "Não foi possível gerar uma resposta.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, ocorreu um erro ao contactar a IA.";
  }
};