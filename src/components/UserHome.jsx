import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import "./styles/UserHome.css"

const fetchCodes = async () => {
  try {
    const response = await axios.get("http://localhost:5000/v1/drivers/Venta")
    return response.data
  } catch (error) {
    console.error("Error al obtener los códigos:", error)
    return []
  }
}

const fetchChatHistory = async (userId) => {
  try {
    const response = await axios.get(`http://localhost:5000/v1/chat/history/${userId}`)
    return response.data.map((msg) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    }))
  } catch (error) {
    console.error("Error al obtener el historial de chat:", error)
    return []
  }
}

const sendMessageToBackend = async (message, userId) => {
  try {
    const response = await axios.post("http://localhost:5000/v1/chat/message", {
      message,
      userId,
    })
    return response.data.response
  } catch (error) {
    console.error("Error al enviar mensaje:", error)
    throw new Error("Error al procesar el mensaje")
  }
}

function UserHome() {
  const [user, setUser] = useState({
    id: "",
    nombre: "",
    correo: "",
    numeroCelular: "",
    ciudad: "",
  })

  const [codes, setCodes] = useState([])
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario")
    if (usuarioGuardado) {
      const userData = JSON.parse(usuarioGuardado)
      setUser(userData)
      loadChatHistory(userData.id || userData.correo)
    }

    const loadCodes = async () => {
      const codesData = await fetchCodes()
      setCodes(codesData)
    }

    loadCodes()
  }, [])

  const loadChatHistory = async (userId) => {
    try {
      const history = await fetchChatHistory(userId)
      setMessages(history)
    } catch (error) {
      console.error("Error cargando historial:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await sendMessageToBackend(inputMessage, user.id || user.correo)

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Lo siento, hubo un error al procesar tu mensaje.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
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

  return (
    <div className="allUserHome">
      <div className="user-home">
        <header className="header">
          <main className="main-content">
            <h1 className="welcome">¡Bienvenido {user.nombre}!</h1>

            <section className="user-info">
              <h2>Información del Usuario</h2>
              <table>
                <tbody>
                  <tr>
                    <td>Nombre:</td>
                    <td>{user.nombre}</td>
                  </tr>
                  <tr>
                    <td>Correo:</td>
                    <td>{user.correo}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="chat-section">
              <h2>Chat Asistente</h2>
              <div className="chat-box">
                {messages.length === 0 ? (
                  <p>No hay mensajes aún. ¡Inicia una conversación!</p>
                ) : (
                  <div className="messages">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`message ${message.role === "user" ? "user-message" : "assistant-message"}`}
                      >
                        <p>{message.content}</p>
                        <span className="timestamp">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="message assistant-message">
                        <p>Escribiendo...</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="input-area">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Escribe tu mensaje aquí..."
                    disabled={isLoading}
                  />
                  <button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
                    Enviar
                  </button>
                </div>
              </div>
            </section>

            <section className="code-list">
              <h2>Historial de Compras</h2>
              {codes.length === 0 ? (
                <p>Cargando historial de compras...</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Valor</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map((code, index) => (
                      <tr key={index}>
                        <td>{code.producto}</td>
                        <td>{code.valor}</td>
                        <td>{new Date(code.fechaV).toLocaleDateString()}</td>
                        <td>{code.Estado}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </main>
        </header>

        <nav>
          <button onClick={() => navigate("/ChangePassword")}>Cambiar Contraseña</button>
          <button onClick={() => navigate("/")}>Cerrar Sesión</button>
        </nav>

        <footer className="footer">
          <p>&copy; 2025 MarketPlace. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  )
}

export default UserHome
