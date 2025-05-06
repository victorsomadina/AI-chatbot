from kelp import MultiModelChat

def get_response(provider, model, messages, api_key, base64_pdf=None, search=False):
    chat_handler = MultiModelChat()
    response = chat_handler.chat(
        provider=provider,
        model=model,
        messages=messages,
        api_key=api_key,
        base64_pdf=base64_pdf,
        search=search
    )
    return response

