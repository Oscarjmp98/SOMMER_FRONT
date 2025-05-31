import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./styles/UserHome.css"

const formatTimestamp = (timestamp) => {
  try {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp)
    return isNaN(date.getTime()) ? new Date().toLocaleTimeString() : date.toLocaleTimeString('es-ES')
  } catch {
    return new Date().toLocaleTimeString()
  }
}

const fetchChatHistory = async (userId) => {
  try {
    const response = await axios.get(`https://sommer-back-steel.vercel.app/api/chat/history/${userId}`);
    // const response = await axios.get(`http://localhost:5000/api/chat/history/${userId}`);
    
    const chatHistory = response.data.flatMap((conv, index) => {
      const baseTime = new Date();
      
      return [
        {
          id: `user_${index}_${Date.now()}`,
          role: "user",
          content: conv.prompt,
          timestamp: baseTime,
          displayTime: formatTimestamp(baseTime)
        },
        {
          id: `assistant_${index}_${Date.now()}`,
          role: "assistant", 
          content: conv.resumen,
          timestamp: new Date(baseTime.getTime() + 1000),
          displayTime: formatTimestamp(new Date(baseTime.getTime() + 1000))
        }
      ];
    });

    return chatHistory.reverse(); // Invierte el orden para que los más recientes estén abajo
  } catch (error) {
    console.error("Error al obtener historial:", error);
    return [];
  }
};


// const fetchChatHistory = async (userId) => {
//   try {
//     const response = await axios.get(`https://sommer-back-steel.vercel.app/api/chat/history/${userId}`)
//     //const response = await axios.get(`http://localhost:5000/api/chat/history/${userId}`)
//     const chatHistory = []
    
//     response.data.forEach((conv, index) => {
//       const baseTime = new Date()
      
//       chatHistory.push({
//         id: `user_${index}_${Date.now()}`,
//         role: "user",
//         content: conv.prompt,
//         timestamp: baseTime,
//         displayTime: formatTimestamp(baseTime)
//       })
      
//       chatHistory.push({
//         id: `assistant_${index}_${Date.now()}`,
//         role: "assistant", 
//         content: conv.resumen,
//         timestamp: new Date(baseTime.getTime() + 1000),
//         displayTime: formatTimestamp(new Date(baseTime.getTime() + 1000))
//       })
//     })
    
//     return chatHistory
//   } catch (error) {
//     console.error("Error al obtener historial:", error)
//     return []
//   }
// }

const sendMessageToBackend = async (prompt, userId) => {
  try {
    const response = await axios.post("https://sommer-back-steel.vercel.app/api/chat", { prompt, userId })
    //const response = await axios.post("http://localhost:5000/api/chat", { prompt, userId })
    return response.data.response
  } catch (error) {
    throw new Error("Error al procesar el mensaje")
  }
}

function UserHome() {
  const [user, setUser] = useState({ id: "", nombre: "", correo: "" })
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const messagesEndRef = useRef(null)
  const navigate = useNavigate()

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })

  useEffect(() => scrollToBottom(), [messages])

  useEffect(() => {
    const loadUserAndHistory = async () => {
      const usuarioGuardado = localStorage.getItem("usuario")
      if (!usuarioGuardado) {
        navigate("/")
        return
      }

      const userData = JSON.parse(usuarioGuardado)
      setUser(userData)
      
      const userId = userData.id || userData.correo
      if (userId) await loadChatHistory(userId)
    }
    loadUserAndHistory()
  }, [navigate])

  const loadChatHistory = async (userId) => {
  setHistoryLoaded(false);
  const history = await fetchChatHistory(userId);
  setMessages(history.reverse()); // Invierte el orden de los mensajes
  setHistoryLoaded(true);
  }

  // const loadChatHistory = async (userId) => {
  //   setHistoryLoaded(false)
  //   const history = await fetchChatHistory(userId)
  //   setMessages(history)
  //   setHistoryLoaded(true)
  // }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userId = user.id || user.correo
    if (!userId) return

    const timestamp = Date.now()
    const currentTime = new Date()

    const userMessage = {
      id: `user_${timestamp}`,
      role: "user",
      content: inputMessage.trim(),
      timestamp: currentTime,
      displayTime: formatTimestamp(currentTime)
    }

    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage.trim()
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await sendMessageToBackend(currentMessage, userId)
      const responseTime = new Date()

      const assistantMessage = {
        id: `assistant_${timestamp}`,
        role: "assistant",
        content: response,
        timestamp: responseTime,
        displayTime: formatTimestamp(responseTime)
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = {
        id: `error_${timestamp}`,
        role: "assistant",
        content: "Error al procesar tu mensaje. Intenta de nuevo.",
        timestamp: new Date(),
        displayTime: formatTimestamp(new Date())
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleLogout = async () => {
  try {
    const usuarioGuardado = JSON.parse(localStorage.getItem("usuario"));
    const userId = usuarioGuardado?.id || usuarioGuardado?.correo;

    if (userId) {
      await axios.post("https://sommer-back-steel.vercel.app/api/chat/logout", {
      //await axios.post("http://localhost:5000/api/chat/logout", {
        userId,
      });
    }

    localStorage.removeItem("usuario");
    navigate("/");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
    navigate("/");
  }
};

return (
  <div className="assistant-layout">
    {/* Contenedor principal con disposición vertical */}
    <div className="assistant-container">
      
      {/* Barra superior con información del usuario y logout */}
      <header className="assistant-header">
        <div className="user-info">
          <h2>{user.nombre}</h2>
          <p>{user.correo}</p>
        </div>
        <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
      </header>

      {/* Contenedor del chat */}
      <main className="chat-container">
        <section className="chat-header">
          <h2>Asistente Virtual</h2>
        </section>

        {/* Contenedor flexible del chat-box */}
        <div className="chat-wrapper">
          <div className="chat-box">
            {!historyLoaded ? (
              <div className="loading-history">
                <p>Cargando historial...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="empty-chat">
                <p>Hola, ¿en qué puedo ayudarte hoy?</p>
              </div>
            ) : (
              <div className="messages">
                {messages.map((message) => (
                  <div key={message.id} className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}>
                    <p>{message.content}</p>
                    <span className="timestamp">{message.displayTime || formatTimestamp(message.timestamp)}</span>
                  </div>
                ))}
                {isLoading && (
                  <div className="message assistant-message loading">
                    <p>Escribiendo...</p>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Área de entrada de mensajes */}
        <div className="input-area">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu mensaje aquí..."
            disabled={isLoading}
            maxLength={500}
          />
          <button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
            {isLoading ? "..." : "Enviar"}
          </button>
        </div>
      </main>
    </div>

    {/* Pie de página */}
    <footer className="assistant-footer">
  <p className="footer-text">&copy; 2025 SOMMER IA - Asistente Virtual.</p>
</footer>
  </div>
);

}

export default UserHome