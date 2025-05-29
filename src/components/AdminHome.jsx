import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './styles/AdminHome.css';


function AdminHome(){
    const home = useNavigate();
    
    const [adminData, setAdminData] = useState({});
    const [ganadores, setGanadores] = useState([]);
    const navigate = useNavigate();

    const palabrasProhibidas = ["hpta", "malparido", "perra"];

    useEffect(() => {
        // Simulación de datos del admin
        setAdminData({
            nombre: "Admin",
            email: "admin@example.com",
            rol: "Administrador"
        });

        // Obtener la lista de ganadores
        fetch('https://gana-como-loco-allrg1104-backend.vercel.app/v1/getPartip')
            .then(response => response.json())
            .then(data => setGanadores(data))
            .catch(error => console.error('Error fetching ganadores:', error));
    }, []);

    function handleSelectSigno(event) {
        const signo = event.target.value;
        if (signo !== "0") {
            setSignoEditar(signo);
        }
    }

    function handleSelectGenero(event) {
        const genero = event.target.value;
        if (genero !== "0") {
            setGeneroEditar(genero);
        }
    }

    function handleClick(e) {
        e.preventDefault();

        const textoProhibido = palabrasProhibidas.some(palabra => textoEditar.toLowerCase().includes(palabra));
        if (textoProhibido) {
            alert("El texto contiene palabras no permitidas. Por favor, modifícalo.");
            return;
        }

        if (signoEditar && generoEditar) {
            fetch(`http://localhost:4000/v1/signos/${signoEditar}?genero=${generoEditar}`, {
                method: 'PATCH',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "textoEditar": textoEditar })
            });
        }
    }

    return (

        <div className='allAdminHome'>
        <div className="admin-home">
        <header className="header">
        <img src="/logo.png" alt="Gana Como Loco Logo" className="logo" />

        <nav>
          <button onClick={() => navigate('/ChangePassword')}>Cambiar Contraseña</button>
          <button onClick={() => navigate('/')}>Cerrar Sesión</button>
        </nav>

      </header>

        <div className="main-content ">
            <h2 id="welcomeAdmin">¡Bienvenido!, {adminData.nombre}</h2>
            
            <section className="admin-info">
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{adminData.nombre}</td>
                        <td>{adminData.email}</td>
                        <td>{adminData.rol}</td>
                    </tr>
                </tbody>
            </table>
            </section>
            

            <section className="lista-codigo">
            <h2>Lista de Ganadores</h2>
            <table>
                <thead>
                    <tr>
                        <th>Fecha de Registro</th>
                        <th>Nombre</th>
                        <th>Cedula</th>
                        <th>Celular</th>
                        <th>Número de Código</th>
                        <th>Premio</th>
                    </tr>
                </thead>
                <tbody>
                    {ganadores.map((ganador, index) => (
                        <tr key={index}>
                            <td>{ganador.fecha}</td>
                            <td>{ganador.nombre}</td>
                            <td>{ganador.cedula}</td>
                            <td>{ganador.numeroCelular}</td>
                            <td>{ganador.code}</td>
                            <td>{ganador.premio}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            </section>
            
        </div>
        </div>
        </div>
    );
}

export default AdminHome;
