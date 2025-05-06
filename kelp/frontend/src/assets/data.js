export const modelsByProvider = {
    "OpenAI": ["gpt-4o-mini", "gpt-4o"],
    "Together AI": [
      "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
      "mistralai/Mistral-7B-Instruct-v0.3",
      "meta-llama/Llama-Vision-Free",
      "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
      "Qwen/Qwen2.5-7B-Instruct-Turbo",
    ],
    "Ollama": [
      "llama3",
      "llama3.2",
      "erwan2/DeepSeek-Janus-Pro-7B",
      "phi4",
      "deepseek-r1",
      "llama3.2-vision:90b",
      "qwen2.5-coder",
      "deepseek-r1:70b",
    ],
    "Gemini": [
      "gemini-1.5-pro",
      "gemini-2.0-flash",
      "gemini-1.5-flash"
    ],
};

export const API = {
  "login" : "http://localhost:3900/api/auth",
  "chatbot" : "http://localhost:3900/api/setup",
}