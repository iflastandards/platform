import React, { useEffect, useState } from "react";

interface AuthStatus {
  isAuthenticated: boolean;
  username?: string;
  teams?: string[];
  keepMeLoggedIn?: boolean;
}

const getStoredAuth = (): AuthStatus => {
  if (typeof window === "undefined") return { isAuthenticated: false };
  const raw = window.localStorage.getItem("authStatus");
  return raw ? JSON.parse(raw) : { isAuthenticated: false };
};

const setKeepMeLoggedIn = (keep: boolean) => {
  const auth = getStoredAuth();
  const updated = { ...auth, keepMeLoggedIn: keep };
  window.localStorage.setItem("authStatus", JSON.stringify(updated));
};

const AuthDropdownNavbarItem: React.FC = () => {
  const [auth, setAuth] = useState<AuthStatus>(getStoredAuth());

  useEffect(() => {
    const onStorage = () => setAuth(getStoredAuth());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (!auth.isAuthenticated) {
    return (
      <a className="navbar__item" href="https://your-next-app.com/login">
        Login with GitHub
      </a>
    );
  }

  const isEditor = auth.teams?.includes("editors");

  return (
    <div className="navbar__item dropdown">
      <button className="dropdown__label">
        {auth.username ?? "Account"} ▼
      </button>
      <ul className="dropdown__menu">
        {isEditor && (
          <li>
            <a href="https://your-next-app.com/editor">Manage</a>
          </li>
        )}
        <li>
          <label style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={!!auth.keepMeLoggedIn}
              onChange={e => {
                setKeepMeLoggedIn(e.target.checked);
                setAuth({ ...auth, keepMeLoggedIn: e.target.checked });
              }}
              style={{ marginRight: 8 }}
            />
            Keep me logged in
          </label>
        </li>
        <li>
          <a href="https://your-next-app.com/logout">Logout</a>
        </li>
      </ul>
      <style>{`
        .dropdown {
          position: relative;
          display: inline-block;
        }
        .dropdown__label {
          background: none;
          border: none;
          cursor: pointer;
          font: inherit;
        }
        .dropdown__menu {
          display: none;
          position: absolute;
          right: 0;
          background: var(--ifm-navbar-background-color, #fff);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          min-width: 180px;
          z-index: 100;
          margin: 0;
          padding: 0.5rem 0;
          list-style: none;
        }
        .dropdown:hover .dropdown__menu,
        .dropdown:focus-within .dropdown__menu {
          display: block;
        }
        .dropdown__menu li {
          padding: 0.5rem 1rem;
        }
        .dropdown__menu li a,
        .dropdown__menu li label {
          color: var(--ifm-navbar-link-color, #222);
          text-decoration: none;
          display: block;
          width: 100%;
        }
        .dropdown__menu li a:hover,
        .dropdown__menu li label:hover {
          background: var(--ifm-navbar-link-hover-background, #f5f5f5);
        }
      `}</style>
    </div>
  );
};

export default AuthDropdownNavbarItem;
