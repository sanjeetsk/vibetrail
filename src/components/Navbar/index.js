import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom';
import { auth } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import './styles.css';

function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            navigate('/dashboard');
        }
    }, [user, loading, navigate]);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <button className={`navbar-toggler ${isOpen ? 'active' : ''}`} onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
            <ul className={`navbar-nav ${isOpen ? 'active' : ''}`}>
                <li className="nav-item">
                    <NavLink to="/dashboard">Home</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/profilePage">Profile Page</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/editProfile">Edit Profile</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/createPost">Create Post</NavLink>
                </li>
                <li className="nav-item">
                    <NavLink to="/logout">Logout</NavLink>
                </li>
            </ul>
        </nav>
    )
}

export default Navbar
