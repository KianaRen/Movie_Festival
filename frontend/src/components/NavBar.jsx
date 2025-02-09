import { Link } from 'react-router-dom';
import '../css/NavBar.css'

function NavBar(){
    return <nav className="navbar">
        <div className="navbar-brand">
            <Link to="/">Movie Festival</Link>
        </div>
        <div className="navbar-links">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/mylist" className="nav-link">My List</Link>
            <Link to="/analysis" className="nav-link">Analysis</Link>
            <Link to="/reports" className="nav-link">Popularity Report</Link>
        </div>
    </nav>
}

export default NavBar