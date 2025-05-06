import base64
import fitz  
import tempfile
import os
import requests
from dotenv import load_dotenv
from openai import OpenAI
import google.generativeai as genai
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search.tool import TavilySearchResults


load_dotenv('credentials.env')
openai_api_key = os.getenv("OPENAI_API_KEY")
tavily_api_key = os.getenv("TAVILY_API_KEY")

class MultiModelChat:
    def __init__(self):
        self.models = {
            "OpenAI": ["gpt-4o-mini", "gpt-4o"],
            "Together AI": [
                "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                "mistralai/Mistral-7B-Instruct-v0.3",
                "meta-llama/Llama-Vision-Free",
                "deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B",
                "Qwen/Qwen2.5-7B-Instruct-Turbo"
            ],
            "Ollama": [],
            "Gemini": ["gemini-1.5-pro", "gemini-2.0-flash", "gemini-1.5-flash"]
        }

    def decode_base64_pdf(self, base64_string: str) -> str:
        """Decode a Base64 string, save as a temporary PDF, and extract text."""
        try:
            pdf_bytes = base64.b64decode(base64_string)
            
            # Create a temporary PDF file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
                temp_pdf.write(pdf_bytes)
                temp_pdf_path = temp_pdf.name
            text = "\n".join([page.get_text("text") for page in fitz.open(temp_pdf_path)])
            
            os.remove(temp_pdf_path)
            
            return text if text.strip() else "No readable text found in the PDF."
        except Exception as e:
            return f"Error decoding Base64 PDF: {str(e)}"

    def search_web(self, query: str) -> str:
        """Perform a web search and return relevant results."""
        try:
            tool = TavilySearchResults(
                max_results=3,
                search_depth="advanced",
                include_answer=True,
                include_raw_content=True,
                include_images=False,
            )
            context = tool.invoke(query)
            return context[0]['content'] if context else "No relevant information found."
        except Exception as e:
            return f"Web search error: {str(e)}"

    def openai_chat(self, model: str, messages: str) -> str:
        """Handle OpenAI chat completion."""
        client = OpenAI(api_key=openai_api_key)
        formatted_messages = [{"role": "user", "content": messages}]
        try:
            response = client.chat.completions.create(
                model=model,
                messages=formatted_messages
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"OpenAI Error: {str(e)}"

    def together_chat(self, api_key: str, model: str, messages: str) -> str:
        """Handle Together AI chat completion."""
        url = "https://api.together.xyz/v1/chat/completions"
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Bearer {api_key}"
        }
        formatted_messages = [{"role": "user", "content": messages}]
        payload = {
            "model": model,
            "messages": formatted_messages
        }
        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content']
        except Exception as e:
            return f"Together AI Error: {str(e)}"

    def ollama_chat(self, model: str, messages: str) -> str:
        """Handle Ollama chat completion."""
        try:
            llm = ChatOpenAI(
                base_url="http://localhost:8000/v1",
                openai_api_key="api key",
                model=model
            )
            response = llm.invoke(messages)
            return response.content
        except Exception as e:
            return f"Ollama Error: {str(e)}"

    def gemini_chat(self, api_key: str, model: str, messages: str) -> str:
        """Handle Gemini (Google AI) chat completion with user-provided API key."""
        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel(model)  
            response = model.generate_content(messages)  
            return response.text 
        except Exception as e:
            return f"Gemini API Error: {str(e)}"

    def chat(self, provider: str, model: str, messages: str, api_key: str = "", base64_pdf: str = None, search: bool = False) -> str:

        pdf_content = self.decode_base64_pdf(base64_pdf) if base64_pdf else None
        if pdf_content:
            messages = f"""Here is the document context from the provided PDF:\n{pdf_content}
            Now use the document context to answer the user's question: {messages}"""

        elif search:
            search_result = self.search_web(messages)
            messages = f"""Here is additional web-searched context: Search Result: {search_result}.
            Use this Search Result to answer the user's question: {messages}"""

        prompt = f"""Format your response in **HTML Markdown style**.
          
            Key formatting requirements:
                - Use <b>text</b> for important points
                - Highlight key insights with <span style='color:[appropriate color];'>text</span>
                - Separate paragraphs with <p>text</p>
                - Use appropriate headings with <h1>, <h2>, etc.
                - Include bullet points where relevant using <ul><li>point</li></ul>
        {messages}
        """

        if provider == "Ollama":
            return self.ollama_chat(model, prompt)
        elif provider == "OpenAI":
            return self.openai_chat(model, prompt)
        elif provider == "Together AI":
            if not api_key:
                return "Together AI API key is required"
            return self.together_chat(api_key, model, prompt)
        elif provider == "Gemini":
            if not api_key:
                return "Gemini API key is required"
            return self.gemini_chat(api_key, model, prompt)
        else:
            return "Invalid provider specified"
        


