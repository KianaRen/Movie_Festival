import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/Login.css";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/api/register", {
                username,
                password,
            },{ withCredentials: true } );
            navigate("/login");
        } catch (err) {
            setError("Registration failed");
        }
    };

    return (
        <div className="login-container"> 
            <form className="login-form" onSubmit={handleRegister}> 
                <h2>Register</h2>
                {error && <p className="error-message">{error}</p>}
                <input
                    type="text"
                    className="input-field" 
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    className="input-field"  
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" className="login-button">Register</button>  
            </form>
        </div>
    );
};

export default Register;
