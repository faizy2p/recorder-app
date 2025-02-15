import './App.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import { default as Nbar } from 'react-bootstrap/Navbar';
import { useLocation } from 'react-router-dom';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from 'react-router-dom'

const Navbar = () => {
    const location = useLocation();
    console.log(location)
    return (
        <div className="row navbar-container">
            <div className="col">
                <Nbar fixed="top" bg="dark" data-bs-theme="dark" expand="lg" className="bg-body-tertiary">
                    <Container>
                        <Nbar.Brand as={Link} to="/">Recorder</Nbar.Brand>
                        <Nbar.Toggle aria-controls="basic-navbar-nav" />
                        <Nbar.Collapse id="basic-navbar-nav">
                            <Nav activeKey={location.pathname} className="me-auto">
                                <Nav.Link as={Link} to="/" >Voice Recorder</Nav.Link>
                                <Nav.Link as={Link} to="/camcorder">Video Recorder</Nav.Link>
                                <NavDropdown active={location.pathname === "/audio-records" || location.pathname === "/video-records"} title="Records" id="collapsible-nav-dropdown">
                                    <NavDropdown.Item as={Link} to="/audio-records" active={location.pathname === "/audio-records"} >Audio Records</NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/video-records" active={location.pathname === "/video-records"}>Video Records</NavDropdown.Item>
                                </NavDropdown>
                            </Nav>
                        </Nbar.Collapse>
                    </Container>
                </Nbar>
            </div>
        </div>
    );
}
export default Navbar;