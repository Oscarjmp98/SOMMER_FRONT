import './styles/Form.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginUser() {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState(''); // Estado para manejar errores
    const navigate = useNavigate();

    const validateUser = async (event) => {
        event.preventDefault();
        setError(''); // Limpiar errores previos

        try {
            //const response = await fetch('http://localhost:5000/v1/drivers/login', {
            const response = await fetch('http://localhost:5000/api/chat/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ correo, contrasena }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la red, intenta nuevamente.');
            }

            if (data.success) {
                // Guardar datos del usuario en localStorage
                localStorage.setItem('usuario', JSON.stringify({
                    nombre: data.user.nombre,
                    correo: data.user.correo
                }));

                // Redirigir según el rol
                navigate(data.user.rol === 'usuario' ? "/userHome" : "/adminHome");
            } 
        } catch (error) {
            console.error('Error:', error);
            setError(error.message); // Mostrar el mensaje de error en pantalla
        }
    };

    return (
        <form onSubmit={validateUser}>
            <h1 id="txtBienvenida">Inicio de sesión</h1>

            <h4 className="txt">Correo:</h4>
            <input type="text" className="entry" value={correo} onChange={(e) => setCorreo(e.target.value)} required /><br />

            <h4 className="txt">Contraseña:</h4>
            <input type="password" className="entry" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required /><br />
            
            {error && <p style={{ color: 'red' }}>{error}</p>} {/* Mensaje de error en pantalla */}

            <button type="submit" id="btnCreateUser">Ingresar</button>
            <button type="button" id="btnCreateUser" onClick={() => navigate('/createUser')}>Crear Usuario</button>
            <button type="button" id="btnCreateUser" onClick={() => navigate('/createAdmin')}>Crear Admin</button>
        </form>
    );
}

export default LoginUser;