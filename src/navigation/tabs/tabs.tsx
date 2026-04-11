import {useState, useEffect, useRef, useCallback } from 'react';
import {NavLink, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleQuestion } from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '../use-navigation.ts';

export function Tabs() {
    useNavigation();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    const handleClickOutside = useCallback((e: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setMenuOpen(false);
        }
    }, []);

    useEffect(() => {
        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen, handleClickOutside]);

    // This renders two menus, CSS controls which is visible
    return (
        <div>
            <FullScreenMenu />
            <HamburgerMenu />
        </div>
    );
}

function FullScreenMenu() {
    return <nav className="dlasim_tab-nav">
        <MenuLinks />
    </nav>
}

function HamburgerMenu() {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    return <div className="dlasim-mobile-nav" ref={menuRef}>
        <button
            className={`dlasim-hamburger-btn${menuOpen ? ' dlasim-hamburger-open' : ''}`}
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
        >
            <span className="dlasim-hamburger-line" />
            <span className="dlasim-hamburger-line" />
            <span className="dlasim-hamburger-line" />
        </button>

        {menuOpen && (
            <nav className="dlasim-mobile-menu">
                <MenuLinks />
            </nav>
        )}
    </div>
}

function MenuLinks() {
    return (<>
        <NavLink to="/simple-2d-animated-dla"
                 className={({isActive}) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
            Simulation
        </NavLink>
        <NavLink to="/distance-gradient"
                 className={({isActive}) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
            Gradient
        </NavLink>
        <NavLink to="/svg-dla" className={({isActive}) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
            SVG
        </NavLink>
        <NavLink to="/3d-dla" className={({isActive}) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
            3D
        </NavLink>
        <NavLink to="/about" className={({isActive}) => `dlasim_tab-link${isActive ? ' dlasim_active' : ''}`}>
            <FontAwesomeIcon icon={faCircleQuestion} className="dlasim_tab-icon"/>
        </NavLink>
    </>);
}
