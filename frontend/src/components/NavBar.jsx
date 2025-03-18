import { Link } from 'react-router-dom';
import '../css/NavBar.css';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

function NavBar() {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Movie Festival</Link>
            </div>
            <div className="navbar-links">
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/mylist" className="nav-link">My List</Link>
                <Link to="/analysis" className="nav-link">Analysis</Link>
                <Link to="/reports" className="nav-link">Popularity Report</Link>
            </div>
            <div className="navbar-auth">
                {user ? (
                    <>
                        <span className="user-welcome">Welcome, {user.username}!</span>
                        <button className="logout-button" onClick={logout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default NavBar;
