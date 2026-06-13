import OpenAI from "openai";
import fs from 'fs';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || 'your-key-here',
});

// Load previous conversation history (if exists)
let conversationHistory = [];

try {
  const saved = fs.readFileSync('./chat-history.json', 'utf8');
  conversationHistory = JSON.parse(saved);
  console.log(`✅ Loaded ${conversationHistory.length} previous messages`);
} catch (e) {
  // Start with system prompt
  conversationHistory = [{
    role: "system",
    content: `You are helping me build "formautomation" - a Next.js 16 + Supabase fullstack app.
    
Current project status:
- Build working
- Need to fix: stacked fields visibility in owner view
- Need to run SQL: drop father's birth date columns
- Need to deploy to Vercel`
  }];
  console.log("🆕 Started new conversation");
}

async function ask(question) {
  console.log(`\n❓ You: ${question}\n`);
  
  conversationHistory.push({ role: "user", content: question });
  
  const response = await openai.chat.completions.create({
    model: "deepseek-chat",
    messages: conversationHistory,
  });
  
  const answer = response.choices[0].message.content;
  conversationHistory.push({ role: "assistant", content: answer });
  
  // Save history
  fs.writeFileSync('./chat-history.json', JSON.stringify(conversationHistory, null, 2));
  
  console.log(`🤖 AI: ${answer}\n`);
  console.log("─".repeat(60));
  
  return answer;
}

// Interactive mode
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("=".repeat(60));
console.log("🤖 PERSISTENT ASSISTANT - API MODE");
console.log("=".repeat(60));
console.log("💡 Your conversation saves automatically");
console.log("💡 Type 'exit' to quit, 'save' to export history\n");

function chat() {
  rl.question("❓ ", async (input) => {
    if (input === 'exit') {
      console.log("\n👋 Goodbye! History saved to chat-history.json");
      rl.close();
      return;
    }
    if (input === 'save') {
      console.log("💾 History saved to chat-history.json");
      chat();
      return;
    }
    await ask(input);
    chat();
  });
}

chat();
