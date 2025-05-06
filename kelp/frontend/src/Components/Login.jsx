import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Login.css";
import "@fortawesome/fontawesome-free/css/all.min.css"; 
import icon_overlay from "../assets/icon_white.png"
import logo from "../assets/publica_no_rider.png";
import { API } from "../assets/data.js"

const Login = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [changingText, setChangingText] = useState("Chat with OpenAI");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const rememberMeRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      emailRef.current.value = savedEmail;
      rememberMeRef.current.checked = true;
    }
  }, []);

  const toggleShow = () => {
    setPasswordVisible((prev) => !prev);
  };

  const validateInputs = () => {
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return false;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setErrorMessage("Invalid email format.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setErrorMessage("");

  if (!validateInputs()) {
    setLoading(false);
    return;
  }

  const email = emailRef.current.value;
  const password = passwordRef.current.value;

  if (rememberMeRef.current.checked) {
    localStorage.setItem("rememberedEmail", email);
  } else {
    localStorage.removeItem("rememberedEmail");
  }

  setLoading(true);

  try {
    const response = await fetch(API.login, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Invalid credentials");
    }

    // localStorage.setItem("token", data.token);
    navigate("/chatbot");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    const words = ["Chat with OpenAI", "Chat with Ollama", "Chat with Together AI"];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % words.length;
      setChangingText(words[index]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='general_container'>
        <img className="overlay_1" src={icon_overlay} alt="Publica Icon Overlay" />
        <img className="logo_on_small" src={logo} alt="" />
        <div className="caption">
            <h1>Quick Help</h1>
            <div className="with_kelp">
                <div className="line"></div>
                <p>with Kelp</p>
                <div className="line"></div>
            </div>
            <div className="text-container">
                <span id="changingText">{changingText}</span>
            </div>
        </div>
        <div className='login_container'>
            <div className="logo_container">
                <img src={logo} alt="Publica Logo" />
            </div>
            <div className="inner_container">
                <div className="login_sub">
                    <h1 className="login">Log in</h1>
                    <p className="rider">Welcome back! Login to continue</p>
                </div>
                <form id="loginForm" onSubmit={handleSubmit}>
                    <div className="input_wrap">
                        <input type="text" placeholder="Email" id="email" ref={emailRef} />
                    </div>
                    <div className="input_wrap">
                        <div className="password_div">
                            <input 
                                type={passwordVisible ? "text" : "password"} 
                                placeholder="Password" 
                                id="password" 
                                ref={passwordRef}
                            />
                            <i 
                                className={`fa-solid ${passwordVisible ? "fa-eye-slash hide" : "fa-eye show"}`} 
                                onClick={toggleShow} 
                            ></i>
                        </div>
                    </div>
                    <p id="error_message" className="error_message">{errorMessage}</p>
                    <div className="rem_login">
                        <div className="terms">
                            <input type="checkbox" id="rememberMe" ref={rememberMeRef} />
                            <p>Remember me</p>
                        </div>
                        <button className='login_btn' type="submit" disabled={loading}>
                          {loading ? "Logging in..." : "Login"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
  );
};

export default Login;
