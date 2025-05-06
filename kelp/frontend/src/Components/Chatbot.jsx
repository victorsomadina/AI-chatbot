import { React, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo_white.png";
import send_icon from "../assets/send.png";
import search_web from "../assets/internet.png";
import upload from "../assets/upload-photo.png";
import copy_icon from "../assets/copy.png";
import "./Chatbot.css";
import { modelsByProvider } from "../assets/data.js";
import { PulseLoader } from "react-spinners";
import { API } from "../assets/data.js";

const Chatbot = () => {
  const [provider, setProvider] = useState("OpenAI");
  const [model, setModel] = useState("");
  const [api, setAPI] = useState("");
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(true);
  const [use_search, setUse_Search] = useState(false);
  const [fileUpload, setFileUpload] = useState(false);
  const [fileName, setFileName] = useState("");
  const [trackMB, setTrackMB] = useState(false)
  const [isUploading, setIsUploading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatActive, setChatActive] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prevProvider, setPrevProvider] = useState(provider);
  const [prevModel, setPrevModel] = useState(model);
  const [firstLoad, setFirstLoad] = useState(true);


  const navigate = useNavigate();

  useEffect(() => {
    const newModel = modelsByProvider[provider][0];
  
    if (newModel !== model) {
      setModel(newModel);
    }
  
    if (!firstLoad && provider !== prevProvider) {
      const systemMessage = {
        text: `<span class="system_message">Switched to <strong>${provider}</strong> - <strong>${newModel}</strong></span>`,
        sender: "system",
      };
      setMessages((prev) => [...prev, systemMessage]);
  
      setPrevProvider(provider);
      setPrevModel(newModel);
    }
  
    setFirstLoad(false);
  }, [provider]);
  
  useEffect(() => {
    if (!firstLoad && model !== prevModel && provider === prevProvider) {
      const systemMessage = {
        text: `<span class="system_message">You're using <strong>${provider}</strong> - <strong>${model}</strong></span>`,
        sender: "system",
      };
      setMessages((prev) => [...prev, systemMessage]);
  
      setPrevModel(model);
    }
  }, [model]);
  
  
  useEffect(() => {
    const chatArea = document.querySelector(".chat_area");
    if (chatArea) {
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  }, [messages]);
  

  const handleSearch = () => {
    if(fileUpload) return;
    setUse_Search(!use_search);
  };

  const handleUpload = () => {
    if(use_search) return;

    setFileUpload(!fileUpload);
    document.getElementById("fileInput").click();
  };

  const handleFileUpload = (e) => {
  const file = e.target.files[0];

  if (file) {
    if (file.size > 2 * 1024 * 1024) { // 5MB limit
      setTrackMB(true);
      setFileName("");
      setFileUpload(false);
      e.target.value = ""; // Clear file input
      return;
    }

    setIsUploading(true); // Start loading indicator
    setTimeout(() => {
      setFileName(file.name);
      setFileUpload(true);
      setIsUploading(false); // Stop loading
    }, 2000); // Simulating upload delay (replace with real upload logic)
  }
};


  const handleFileCancel = () => {
    setFileName("")
    setFileUpload(false);
    document.getElementById("fileInput").value = "";
  }
  
  const handleMbCancel = () => {
    setFileName("")
    setTrackMB(false)
    setFileUpload(false)
  }

  const copyToClipboard = (htmlText, index) => {
    // Create a temporary div to extract plain text
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = htmlText;
    const plainText = tempDiv.innerText; // Extract plain text
    
    navigator.clipboard.writeText(plainText);
    setCopiedMessageIndex("to_copy"); // Show "Copied!" for this message
    setTimeout(() => setCopiedMessageIndex(null), 2000); // Hide it after 2s
  };
  

  const fetchBotResponse = async (userInput) => {
    setIsLoading(true); // Start loading
  
    try {
      const response = await fetch(API.chatbot, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: provider,
          model: model,
          apiKey: api,
          prompt_message: userInput,
          // use_search: use_search,
        }),
      });
  
      const data = await response.json();
      const botMessage = { text: data?.response || "Error: No response from server", sender: "bot" };
  
      setMessages((prev) => {
        const updatedMessages = [...prev, botMessage];
  
        setChatHistory(prevHistory =>
          prevHistory.map(chat =>
            chat.id === selectedChatId ? { ...chat, messages: updatedMessages } : chat
          )
        );
  
        return updatedMessages;
      });
    } catch (error) {
      const errorMessage = { text: "Error: Unable to fetch response", sender: "bot" };
  
      setMessages((prev) => {
        const updatedMessages = [...prev, errorMessage];
  
        setChatHistory(prevHistory =>
          prevHistory.map(chat =>
            chat.id === selectedChatId ? { ...chat, messages: updatedMessages } : chat
          )
        );
  
        return updatedMessages;
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  
  

  const handleSendMessage = () => {
    setFileName("")
    setFileUpload(false)
    // use_search(false)

    if (input.trim() === "" || isLoading) return;
  
    setChatActive(true);
    const userMessage = { text: input, sender: "user" };
  
    setMessages((prev) => {
      const updatedMessages = [...prev, userMessage];
  
      if (selectedChatId) {
        // Update existing chat in history
        setChatHistory(prevHistory =>
          prevHistory.map(chat =>
            chat.id === selectedChatId ? { ...chat, messages: updatedMessages } : chat
          )
        );
      } else {
        // If no chat is selected, create a new one
        const firstQuery = input.length > 20 ? input.substring(0, 20) + "..." : input;
        const newChat = { id: Date.now(), title: firstQuery, messages: updatedMessages };
        setChatHistory(prevHistory => [...prevHistory, newChat]);
        setSelectedChatId(newChat.id);
      }
  
      return updatedMessages;
    });
  
    fetchBotResponse(input);
    setInput("");
  };
  

  const handleNewChat = () => {
    if (messages.length > 0) {
      // Get first bot response
      const firstUserMessage = messages.find(msg => msg.sender === "bot")?.text || "Untitled Chat";
  
      // Strip HTML tags for clean text
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = firstUserMessage;
      const plainText = tempDiv.innerText;
      
      // Get first 20 characters for title
      const firstQuery = plainText.length > 20 ? plainText.substring(0, 20) + "..." : plainText;
  
      if (selectedChatId) {
        // Update existing chat in history
        setChatHistory(prevHistory =>
          prevHistory.map(chat =>
            chat.id === selectedChatId ? { ...chat, messages } : chat
          )
        );
      } else {
        // Create a new chat and store it in history
        const newChat = { id: Date.now(), title: firstQuery, messages: [...messages] };
        setChatHistory(prevHistory => [...prevHistory, newChat]);
      }
    }
  
    // Reset for new chat
    setMessages([]);
    setSelectedChatId(null); // Ensure new chat is not linked to old chat
    setChatActive(false);
  };
  
  
const handleSelectChat = (chatId) => {
  const selectedChat = chatHistory.find(chat => chat.id === chatId);
  if (selectedChat) {
    setMessages(selectedChat.messages);
    setSelectedChatId(chatId);
    setChatActive(true);
  }
};
  
const handleDeleteChat = (chatId) => {
  setChatHistory(prevHistory => prevHistory.filter(chat => chat.id !== chatId));
  // If the deleted chat is currently selected, reset the chat area
  if (selectedChatId === chatId) {
    setMessages([]);
    setSelectedChatId(null);
    setChatActive(false);
  }
};

const handleLogout = () => {
  // localStorage.removeItem("token");
  navigate("/login");
}



  return (
    <div className="general_chatbot_container">
      <button className="menu_toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <i className={`fas ${menuOpen ? "fa-arrow-left" : "fa-arrow-right"}`}></i>
      </button>

      <div className={`menu ${menuOpen ? "open" : "closed"}`}>
        <img src={logo} alt="Logo" />

        <div className="provider">
          <p>Select Provider</p>
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setModel("");
            }}
          >
            {Object.keys(modelsByProvider).map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>

          <p>Select Model</p>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value="">-- Select Model --</option>
            {modelsByProvider[provider]?.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>

          {(provider === "Together AI" || provider === "Gemini") && (
            <>
              <p>API Key</p>
              <input
                className="api_input"
                type="text"
                placeholder="Insert your API key"
                value={api}
                onChange={(e) => setAPI(e.target.value)}
              />
            </>
          )}
        </div>

        <div className="history_container">
          <div className="history">
            <p className="history_text">Chat History</p>
            <p className="plus_text" onClick={handleNewChat}>+ New Chat</p>
          </div>
          <div className="saved_chats">
            {chatHistory.map(chat => (
              <div key={chat.id}
              className={`chat_history_item ${selectedChatId === chat.id ? "active" : ""}`}>
                <p onClick={() => handleSelectChat(chat.id)}>{chat.title}</p>
                <button className="delete_chat_btn" onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat.id);
                }}><i class="fa-solid fa-xmark"></i></button>
              </div>
            ))}
          </div>

        </div>

        <div className="logout" onClick={handleLogout}> <p>Logout</p> </div>
      </div>

      <div className={`main ${menuOpen ? "" : "full_width"}`}>
        <div className="inner_main">
          {!chatActive ? (
            <div className="intro">
              <h1 className="slideInFromBottom">Chat with Kelp</h1>
              <p className="opening_rider">Your all-in-one AI assistant for quick help</p>
            </div>
          ) : (
            <div className="chat_area">
              {messages.map((msg, index) => (
                <div key={index} className={`chat_message ${msg.sender}`}>
                  {msg.sender === "bot" && (
                    <div className="bot_message_content">
                      <div className="gen_copy_cont">
                        <div className="copy_icon_con" onClick={() => copyToClipboard(msg.text, index)}>
                          <img src={copy_icon} alt="Copy" className="copy_icon" />
                          <span>{copiedMessageIndex === "to_copy" ? "Copied!" : "Copy"}</span>
                        </div>
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: msg.text }}></div>
                    </div>
                  )}
                  {msg.sender !== "bot" && <div dangerouslySetInnerHTML={{ __html: msg.text }}></div>}
                </div>
              ))}

              {/* Show loading animation if waiting for response */}
              {isLoading && (
                <div className="chat_message bot">
                  <div className="bot_message_content">
                    <PulseLoader color="#888" speedMultiplier={0.7} size={12} />
                  </div>
                </div>
              )}
            </div>
          )}

          {fileName && (
            <div className="file_name">
              <span><strong>File Uploaded:</strong></span>
              <p className="file-name-display">{fileName}</p>
              <i className="fa-solid fa-xmark" onClick={handleFileCancel}></i>
            </div>
          )}

          {trackMB && (
            <div className="file_name">
              <p className="file-name-display">File size must be less than 5MB!</p>
              <i className="fa-solid fa-xmark" onClick={handleMbCancel}></i>
            </div>
          )}

          {/* {fileName && (
            trackMB === false ? (
              <div className="file_name">
                <span><strong>File Uploaded:</strong></span>
                <p className="file-name-display">{fileName}</p>
                <i className="fa-solid fa-xmark" onClick={handleFileCancel}></i>
              </div>
            ) : (
              <div className="file_name">
                <p className="file-name-display">File size must be less than 5MB!</p>
                <i className="fa-solid fa-xmark" onClick={handleMbCancel}></i>
              </div>
            )
          )} */}

          {isUploading && <PulseLoader color="#888" speedMultiplier={0.7} size={10} style={{marginBottom: "5px", marginLeft: "5px"}} />}

          <div className="chat_input_area">
            <div className="serach_upload_con">
              <div className={`search_upload ${use_search ? "active" : ""}`} onClick={handleSearch}>
                <img src={search_web} style={{ cursor: fileUpload ? "not-allowed" : "pointer" }} alt="" width="30px" />
              </div>
              <div className={`search_upload ${fileUpload ? "active" : ""}`} onClick={handleUpload} style={{ cursor: use_search ? "not-allowed" : "pointer" }}>
                <img src={upload} alt="" width="30px" />
                <input 
                  type="file" 
                  id="fileInput" 
                  style={{ display: "none" }} 
                  onChange={handleFileUpload}
                />
              </div>
            </div>
            <textarea
              id="input"
              placeholder="Enter your question here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            ></textarea>
            <button className="button" onClick={handleSendMessage}>
              <img src={send_icon} alt="" width="30px" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
