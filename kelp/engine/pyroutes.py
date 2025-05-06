from flask import Flask, request, jsonify
from flask_cors import CORS
from chat import get_response
from dotenv import load_dotenv
import os
import requests
import time
from datetime import datetime
import base64
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route('/api/setup', methods=['POST'])
def setup():
    try:
        data = request.json
        provider = data.get('provider')
        model = data.get('model')
        api_key = data.get('apiKey')
        search = data.get('search', False)
        base64_pdf = data.get('base64_pdf', None)
        messages = data.get('prompt_message')
        response = get_response(provider, model, messages, api_key, base64_pdf=base64_pdf, search=search)
    except Exception as e:
        logging.error(f"Setup Error: {e}")
        return jsonify({"error": str(e)})

@app.route('/v1/chat/completions', methods=["POST"])
def completions():
    try:
        data = request.json
        messages = data.get("messages")
        model = data.get("model", "llama3")  
        search = data.get("search", False)  
        base64_pdf = data.get("base64_pdf", None)  

        logging.info(data)

        if not messages:
            return jsonify({"error": "Missing messages"}), 400

      
        prompt = ""
        for msg in messages:
            if msg["role"] == "user":  
                prompt += msg["content"] + " "

        if not prompt:
            return jsonify({"error": "Missing prompt"}), 400
        
        if base64_pdf:
            response = get_response("Ollama", model, prompt.strip(), api_key="", base64_pdf=base64_pdf, search=search)
            return jsonify({"response": response})

        if search:
            response = get_response("Ollama", model, prompt.strip(), api_key="", search=True)
            return jsonify({"response": response})

        # Default: Send the request to Ollama without PDF or search
        OLLAMA_URL = "http://197.159.74.29:11434/api/generate"
        response = requests.post(OLLAMA_URL, json={"prompt": prompt.strip(), "model": model, "stream": False})
        
        if response.status_code != 200:
            logging.info(response.json())
            return jsonify({"error": "Error from Ollama"}), 500

        response_data = response.json()
        
        created = response_data.get("created_at")
        if created:
            # Truncate nanoseconds to microseconds
            truncated_created = created[:26] + "Z" 
            created_timestamp = int(time.mktime(datetime.strptime(truncated_created, "%Y-%m-%dT%H:%M:%S.%fZ").timetuple()))
        else:
            created_timestamp = int(time.time()) 

       
        return jsonify({
            "id": response_data.get("response"),
            "object": "chat.completion",
            "created": created_timestamp,
            "model": model,
            "choices": [{
                "message": {
                    "role": "assistant",
                    "content": response_data.get("response")
                },
                "finish_reason": "stop"
            }]
        })
    except Exception as e:
        logging.error(str(e))
        return jsonify({"error": str(e)})

if __name__ == "__main__":
    port = os.getenv("PORT")
    app.run(debug=True, host="0.0.0.0", port=8000)
