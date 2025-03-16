import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div>
            <h2>Welcome, {user?.username}!</h2>
            <button onClick={() => { logout(); navigate("/login"); }}>Logout</button>
        </div>
    );
};

export default Dashboard;
