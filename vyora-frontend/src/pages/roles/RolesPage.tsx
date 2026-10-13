import React from 'react';
import { AccountHubPage } from '../account/AccountHubPage';

/**
 * RolesPage delegates directly to the unified AccountHubPage with the Roles tab active.
 */
export const RolesPage: React.FC = () => {
  return <AccountHubPage />;
};
