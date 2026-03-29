export async function generateVoiceOutput(text: string, voiceName: string = 'Kore') {
  console.log("Mock Voice Output (Gemini Disabled):", text);
  return null;
}

export async function analyzeWebsite(url: string) {
  console.log("Mock Website Analysis (Gemini Disabled):", url);
  return "Website analysis is currently disabled. Please provide details manually.";
}

export async function generateBotResponse(prompt: string, knowledgeBase: string, personality: string = 'friendly', customInstructions: string = '', primaryLanguage: string = 'auto') {
  console.log("Mock Bot Response (Gemini Disabled):", prompt);
  
  const responses = [
    "That's an interesting question! As a mock assistant, I can tell you that Botify is great for building custom bots.",
    "I've received your message. If I were connected to an AI, I'd give you a much more detailed answer based on your knowledge base!",
    "Botify allows you to manage knowledge bases and deploy widgets easily.",
    "Hello! I'm currently running in mock mode because Gemini is disconnected."
  ];
  
  // Simple keyword matching for demo purposes
  if (prompt.toLowerCase().includes("hello") || prompt.toLowerCase().includes("hi")) {
    return "Hello! How can I help you with Botify today? (Mock Response)";
  }
  
  if (prompt.toLowerCase().includes("price") || prompt.toLowerCase().includes("premium")) {
    return "Botify offers a Premium plan for advanced features. Check the Premium page for details! (Mock Response)";
  }

  return responses[Math.floor(Math.random() * responses.length)];
}
