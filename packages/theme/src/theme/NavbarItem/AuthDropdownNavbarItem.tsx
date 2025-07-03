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
    <div className="navbar__item navbar__item--show-mobile dropdown dropdown--hoverable dropdown--right">
      <a className="navbar__link" role="button" tabIndex={0}>
        {username ?? "Account"}
        <svg width="8" height="8" className="dropdown__caret" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
        </svg>
      </a>
      <ul className="dropdown__menu">
        {isEditor && (
          <li>
            <a className="dropdown__link" href={adminConfig.dashboardUrl}>Manage</a>
          </li>
        )}
        <li>
          <label className="dropdown__link" style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
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
          <a className="dropdown__link" href={adminConfig.signoutUrl}>Logout</a>
        </li>
      </ul>
    </div>
  );
};

export default AuthDropdownNavbarItem;
