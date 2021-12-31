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
            <img
              src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fclose%20button.png?alt=media&token=7b24ee63-c6e6-4497-bf5e-2d9be4505437"
              alt="close-icon-navsidebar"
            />
          </a>
        </Link>
      </div>

      <li onClick={() => props.showNavSidebar(false)}>
        <Link href="/">
          <a>
            <div>
              <img
                src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fhome%20picblue.png?alt=media&token=c4111571-691c-4570-9d8e-e8114072ce26"
                alt="home-icon-navsidebar"
              />
              <span>Home</span>
            </div>
          </a>
        </Link>
      </li>

      <li onClick={() => props.showNavSidebar(false)}>
        <Link href="/answer">
          <a>
            <div>
              <img
                src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fpen%20paper%20blue.png?alt=media&token=c3e17c6e-96e7-493b-951e-0ceed57c3b8c"
                alt="answer-icon-navsidebar"
              />
              <span>Answer</span>
            </div>
          </a>
        </Link>
      </li>

      <li onClick={() => props.showNavSidebar(false)}>
        <Link href="/categories">
          <a>
            <div>
              <img
                src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Flist%20icon%20blue.png?alt=media&token=e049d0ba-4a65-47f0-be20-271527db0c7a"
                alt="category-icon-navsidebar"
              />
              <span>Categories</span>
            </div>
          </a>
        </Link>
      </li>

      <li onClick={() => props.showNavSidebar(false)}>
        <Link href="/notifications">
          <a>
            <div onClick={props.handleNotificationClick}>
              <img
                src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fbell%20icon%20blue.png?alt=media&token=97337c4a-5823-40e3-be2c-e54f88ea5543"
                alt="bell-icon-navsidebar"
              />
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
              <img
                src="https://firebasestorage.googleapis.com/v0/b/pennedit-nextjs.appspot.com/o/pennedit-inapp-images%2Fpaperplane%20icon%20blue.png?alt=media&token=fa9f5480-63dd-4ba7-bd65-b741eb08ad21"
                alt="plane-icon-navsidebar"
              />
              <span>Following</span>
            </div>
          </a>
        </Link>
      </li>
    </ul>
  );
}

export default NavSidebar;
