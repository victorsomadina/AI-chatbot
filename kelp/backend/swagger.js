export default {
  openapi: "3.0.0",
  info: {
    title: "Kelp API",
    version: "1.0.0",
    description: "API for Kelp chatbot"
  },
  servers: [
    {
      url: "https://api.kelp.publicaai/api-docs"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  security: [{bearerAuth: []}],
  paths: {
    "/setup": {
      post: {
        summary: "Send specified request to setup API",
        security: [{bearerAuth: []}
        ],
        tags: ["Setup"],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  provider: {
                    type: "string",
                    example: "OpenAI"
                  },
                  model: {
                    type: "string",
                    example: "gpt-4o"
                  },
                  apiKey: {
                    type: "string",
                    example: "your-api-key"
                  },
                  prompt_message: {
                    type: "string",
                    example: "How are you?"
                  },
                  file: {
                    type: "file",
                    format: "binary" 
                  },
                  use_search: {
                    type: "boolean",
                    example: true
                  },
                  new_chat: {
                    type: "boolean",
                    example: true
                }
              }
              }
            }
          }
        },
        responses: {
          200: {
            description: "File processed successfully"
          },
          400: {
            description: "Bad Request"
          }
        }
      }
    },
    "/auth": {
      post: {
        summary: "Authenticate user",
        tags: ["Authentication"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    example: "user@example.com"
                  },
                  password: {
                    type: "string",
                    example: "password"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Authentication successful"
          },
          404: {
            description: "User not found"
          },
          401: {
            description: "Unauthorized - Invalid email and password"
          },
          500: {
            description: "Server error"
          }
        }
      }
    },
    "/chatHistory": {
      get: {
        summary: "Get chat history from the database",
        security: [{bearerAuth: []}],
        tags: ["Get Chat History"],
        responses: {
          200: {
            description: "Chat history retrieved successfully"
          },
          400: {
            description: "Error retrieving chat history"
          }
        }
      }
    },
    "/messgesByChatHistoryId": {
      get: {
        summary: "Get messages by specific provider and model",
        security: [{bearerAuth: []}],
        tags: ["Get Messages"],
        responses: {
          200: {
            description: "Messages retrieved successfully"
          },
          400: {
            description: "Error retrieving messages"
          }
        }
      }
    }
  }
};
