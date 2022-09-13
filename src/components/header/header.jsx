import {
  Alignment,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Button,
  Classes,
} from "@blueprintjs/core";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import "./header.css";

const Header = () => {
  const location = useLocation();
  const selectedPage = location.pathname;

  const navigate = useNavigate();

  return (
    <div className="main">
      <Navbar>
        <div className="navbar-main">
          <NavbarGroup align={Alignment.LEFT}>
            <NavbarHeading>
              <a onClick={() => navigate("/home")}>Thomas Potter</a>
            </NavbarHeading>
            <NavbarDivider />
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <Button
              className={Classes.MINIMAL}
              icon="home"
              text="Home"
              active={selectedPage === "/home"}
              onClick={() => navigate("/home")}
            />
            <Button
              className={Classes.MINIMAL}
              icon="projects"
              text="Projects"
              active={selectedPage === "/projects"}
              onClick={() => navigate("/projects")}
            />
            <Button
              className={Classes.MINIMAL}
              icon="graph"
              text="Demos"
              active={selectedPage === "/demos"}
              onClick={() => navigate("/demos")}
            />
            <Button
              className={Classes.MINIMAL}
              icon="globe"
              text="Ski Map"
              active={selectedPage === "/ski-map"}
              onClick={() => navigate("/ski-map")}
            />
            <Button
              className={Classes.MINIMAL}
              icon="ship"
              text="Ocean Tracking"
              active={selectedPage === "/ocn-tracking"}
              onClick={() => navigate("/ocn-tracking")}
            />
            <Button
              className={Classes.MINIMAL}
              icon="trending-up"
              text="Stocks"
              active={selectedPage.includes("stocks")}
              onClick={() => navigate("/stocks/home")}
            />
          </NavbarGroup>
        </div>
      </Navbar>
      <Outlet />
    </div>
  );
};

export default Header;
