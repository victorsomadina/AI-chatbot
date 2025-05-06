import user from './database/db.js';
import { User, userChatHistory, userChatHistoryMessages} from './database/schema.js';
import jwt from "jsonwebtoken";
import axios from "axios";
import "dotenv/config";
import bcrypt from "bcryptjs";

// authenticate user
const auth = async (req, res) => {
  try {
      const { 
        email, 
        password 
    } = req.body;
      const userExist = await User.findOne({ 
        where: { 
            email 
        } 
    });
      if (!userExist) {
          return res.status(404).json({ 
            error: "User not found" 
        });
      }
      const validPassword = await bcrypt.compare(password, userExist.password);
      if (!validPassword) {
          return res.status(401).json({ 
            error: "Invalid email or password" 
        });
      }
      const token = jwt.sign({ 
        email 
    }, process.env.TOKEN_SECRET, { 
        expiresIn: process.env.TOKEN_EXPIRY 
    });
      return res.status(200).json({token});
  } catch (error) {
      return res.status(500).json({ 
        error: error.message
    });
  }
};

// setup endpoint
const setup = async (req, res) => {
  try {
      const { 
        provider, 
        model, 
        apiKey, 
        prompt_message, 
        use_search, 
        chatHistoryId 
    } = req.body;  
      const user = req.user;
      const userId = user.id;
      const file = req.file;

      let response;
      let chathistory;

      if (file) {
        const fileBase64 = `data:${
            file.mimetype
        };base64,${
            file.buffer.toString("base64")
        }`;
        response = await axios.post(
        process.env.ASSISTANT_URL,
              {
                  provider,
                  model,
                  apiKey,
                  prompt_message,
                  use_search,
                  base64_pdf: fileBase64
              },
              {
                  headers: {
                      "Content-Type": "application/json",
                      "Authorization": req.header("Authorization")
                  },
              }
          )
      } else {
          response = await axios.post(
              process.env.ASSISTANT_URL,
              {
                  provider,
                  model,
                  apiKey,
                  prompt_message,
                  use_search
              },
              {
                  headers: {
                      "Content-Type": "application/json",
                      "Authorization": req.header("Authorization")
                  },
              }
          );
      }
       const messages = [
              {
                  "Human": prompt_message,
                  "Assistant": response.data,
              },
          ];

          if (!chatHistoryId) { // if the chathistory does not exist, a new one is created
            chathistory = await userChatHistory.create({ userId });
        
            await userChatHistoryMessages.create({
                chatHistoryId: chathistory.chatHistoryId,
                provider,
                model,
                messages: JSON.stringify(messages)
            });
        
        } else { // otherwise, find the existing chathistory
            const detailsExist = await userChatHistoryMessages.findOne({
                where: { chatHistoryId }
            });
        
            if (detailsExist) {
                const existingMessages = detailsExist.messages 
                ? JSON.parse(detailsExist.messages) : [];
                existingMessages.push(...messages); 
        
                await detailsExist.update({ 
                    messages: JSON.stringify(
                        existingMessages
                    ) 
                });
        
            } else {        
                await userChatHistoryMessages.create({
                    provider,
                    model,
                    messages: JSON.stringify(
                        messages
                    )
                });
            }
        };
        return res.status(200).json(response.data);
  } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      res.status(400).json({ error: error.response ? error.response.data : error.message });
  }
};

// get chathistory endpoint
const getChatHistory = async (req, res) => {
    try {
     const user = req.user;
     const userId = user.id;
      res.json(
        await userChatHistory.findAll({
            where: { 
                userId 
            },
            include: [{ 
                model: userChatHistoryMessages 
            }],
        })
      )
      return res.status(200);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
  }

const getMessagesByChatHistoryId = async (req, res) => {
    try {
        const { chatHistoryId } = req.body;
        const detailsExist = await userChatHistory.findOne({
            where: { chatHistoryId },
            include: [{ model: userChatHistoryMessages }],
        });
        return res.status(200).json(detailsExist);
    } catch (error) {
        console.error('Error:', error);
        return res.status(400).json({ error: error.message });
    }
};

export { auth, setup, getChatHistory, getMessagesByChatHistoryId } 


