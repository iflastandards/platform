import React from "react";
import { useAdminSession } from "../../hooks/useAdminSession";
import { getAdminPortalConfigAuto } from "../../config/siteConfig";

const AuthDropdownNavbarItem: React.FC = () => {
  const { session, isAuthenticated, username, teams, loading } = useAdminSession();
  const adminConfig = getAdminPortalConfigAuto();

  const setKeepMeLoggedIn = (keep: boolean) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("auth-keep-signed-in", keep.toString());
      // Update the session state
      const currentAuth = JSON.parse(window.localStorage.getItem("authStatus") || "{}");
      const updated = { ...currentAuth, keepMeLoggedIn: keep };
      window.localStorage.setItem("authStatus", JSON.stringify(updated));

      // Dispatch storage event for cross-component communication
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'authStatus',
        newValue: JSON.stringify(updated)
      }));
    }
  };

  if (loading) {
    return (
      <div className="navbar__item">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <a className="navbar__item" href={adminConfig.signinUrl}>
        Editor Login
      </a>
    );
  }

  const isEditor = teams?.includes("editors");

  return (
    <div className="navbar__item dropdown">
      <button className="dropdown__label">
        {username ?? "Account"} ▼
      </button>
      <ul className="dropdown__menu">
        {isEditor && (
          <li>
            <a href={adminConfig.dashboardUrl}>Manage</a>
          </li>
        )}
        <li>
          <label style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={!!session.keepMeLoggedIn}
              onChange={e => {
                setKeepMeLoggedIn(e.target.checked);
              }}
              style={{ marginRight: 8 }}
            />
            Keep me logged in
          </label>
        </li>
        <li>
          <a href={adminConfig.signoutUrl}>Logout</a>
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
