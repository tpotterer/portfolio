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
import React from "react";

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
              <a onClick={() => navigate("/")}>Thomas Potter</a>
            </NavbarHeading>
            <NavbarDivider />
          </NavbarGroup>
          <NavbarGroup align={Alignment.RIGHT}>
            <Button
              className={Classes.MINIMAL}
              icon="home"
              text="Home"
              active={selectedPage === "/"}
              onClick={() => navigate("/")}
            />
            <Button
              className={Classes.MINIMAL}
              icon="graph"
              text="MLP"
              active={selectedPage.includes("mlp")}
              onClick={() => navigate("/mlp")}
            />
            <Button
              className={Classes.MINIMAL}
              icon="predictive-analysis"
              text="Regex Helper"
              active={selectedPage.includes("regex")}
              onClick={() => navigate("/regex")}
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
