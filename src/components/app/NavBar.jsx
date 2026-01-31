"use client"


import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useVars } from '../VarsContext';
import FindJob from './menu/FindJob';


import Image from 'next/image';

export default function MyNavBar({ setPage, setAnnotating }) {

    const { BASE_URL, SERVER_URL } = useVars();

    return (
        <Navbar bg="dark" data-bs-theme="dark" className="bg-body-tertiary" style={{ fontSize: "1.2em" }}>
            <Container fluid>
                <Navbar.Brand href="#home">
                    <Image
                        src={`${BASE_URL}/icon.ico`}
                        width="30"
                        height="30"
                        className="d-inline-block align-top"
                        alt="TurboPutative"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {/* LEFT NAVMENU */}
                    <Nav className="me-auto">
                        <Nav.Link href="home" className='mx-2'>Home</Nav.Link>
                        <Nav.Link href="webserver" className='mx-2'>TurboPutative</Nav.Link>
                        <Nav.Link href="TurbOmicsApp.html" active className='mx-2'>TurbOmics</Nav.Link>
                        <Nav.Link href="webservices" className='mx-2'>Web Services</Nav.Link>
                        <NavDropdown title="Help" id="basic-nav-dropdown">
                            <NavDropdown.Item href="webserverhelp">TurboPutative</NavDropdown.Item>
                            <NavDropdown.Item href={`${SERVER_URL}/turbomicshelp`}>TurbOmics</NavDropdown.Item>
                            <NavDropdown.Item href="webserviceshelp">Web Services</NavDropdown.Item>
                            <NavDropdown.Divider />
                            <NavDropdown.Item href="moduleshelp">Modules</NavDropdown.Item>
                        </NavDropdown>
                        <Nav.Link href="contactUs" className='mx-2'>Contact us</Nav.Link>
                    </Nav>
                    {/* RIGHT NAVMENU */}
                    <Nav className="ms-auto align-items-center">
                        <FindJob setPage={setPage} setAnnotating={setAnnotating} />
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
}