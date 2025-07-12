import React from "react";
import { getAdminPortalConfigAuto } from "../../config/siteConfig";

const AuthDropdownNavbarItem: React.FC = () => {
  const adminConfig = getAdminPortalConfigAuto();

  // Since we no longer handle authentication in Docusaurus sites,
  // just provide a link to the admin portal
  return (
    <div className="navbar__item">
      <a 
        href={adminConfig.dashboardUrl} 
        className="navbar__link"
        target="_blank"
        rel="noopener noreferrer"
      >
        Admin Portal
      </a>
    </div>
  );
};

export default AuthDropdownNavbarItem;