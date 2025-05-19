import React, { useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import './DropDown.css';

const DropDown = ({ icon, idUsuario, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    
    const toggle = () => {
        if (idUsuario) {
            setIsOpen(!isOpen);
        }
    };

    const handleMouseEnter = () => {
        if (idUsuario) {
            setIsOpen(true);
        }
    };

    const handleMouseLeave = () => {
        setIsOpen(false);
    };

    const handleNavigation = (path) => {
        navigate(path);
        setIsOpen(false);
    };
    
    return (
        <Dropdown
            className="custom-dropdown"
            isOpen={isOpen}
            toggle={toggle}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            direction="down"
            inNavbar={true} 
            ref={dropdownRef}
        >
            <DropdownToggle tag="span" className="cursor-pointer">
                {icon}
            </DropdownToggle>
            <DropdownMenu 
                className="dropdown-menu-custom" 
                container="body"
            >
                <DropdownItem header>PERFIL</DropdownItem>
                <DropdownItem onClick={() => handleNavigation('/Dashboard')} className="dropdown-item-custom">
                    Panel
                </DropdownItem>
                <DropdownItem onClick={() => handleNavigation('/orders')} className="dropdown-item-custom">
                    Pedidos
                </DropdownItem>
                <DropdownItem onClick={() => handleNavigation('/DireccionUsuario')} className="dropdown-item-custom">
                    Dirección
                </DropdownItem>
                <DropdownItem onClick={() => handleNavigation('/PerfilUsuario')} className="dropdown-item-custom">
                    Detalles de la cuenta
                </DropdownItem>
                <DropdownItem divider />
                <DropdownItem onClick={onLogout} className="dropdown-item-logout">
                    Cerrar sesión
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
};

export default DropDown;