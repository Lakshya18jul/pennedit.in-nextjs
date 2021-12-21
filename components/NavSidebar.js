import React from "react";
// import "./NavSidebar.css";
import Link from "next/link";

function NavSidebar(props) {
  return (
    <ul className="nav-menu-items">
      <div
        className="navbar-toggle"
        onClick={() => props.showNavSidebar(false)}
      >
        <Link href="#">
          <a>
            <i className="fas fa-times"></i>
          </a>
        </Link>
      </div>

      <li onClick={() => props.showNavSidebar(false)}>
        <Link href="/">
          <a>
            <div>
              <i className="fas fa-home"></i>
              <span>Home</span>
            </div>
          </a>
        </Link>
      </li>

      <li onClick={() => props.showNavSidebar(false)}>
        <Link href="/answer">
          <a>
            <div>
              <i className="fas fa-edit"></i>
              <span>Answer</span>
            </div>
          </a>
        </Link>
      </li>

      <li onClick={() => props.showNavSidebar(false)}>
        <Link href="/categories">
          <a>
            <div>
              <i className="fas fa-list"></i>
              <span>Categories</span>
            </div>
          </a>
        </Link>
      </li>

      <li onClick={() => props.showNavSidebar(false)}>
        <Link href="/notifications">
          <a>
            <div onClick={props.handleNotificationClick}>
              <i className="fas fa-bell"></i>
              <span>Notifications</span>
              {props.isNotificationDot && (
                <div className="notification-red-symbol-sidebar"></div>
              )}
            </div>
          </a>
        </Link>
      </li>

      <li onClick={() => props.showNavSidebar(false)}>
        <Link href="/following">
          <a>
            <div>
              <i className="fas fa-paper-plane"></i>
              <span>Following</span>
            </div>
          </a>
        </Link>
      </li>
    </ul>
  );
}

export default NavSidebar;
