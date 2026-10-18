import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ForbiddenView } from './ForbiddenView';

interface PlanGateRouteProps {
  children: React.ReactNode;
  requiredPlan?: 'growth' | 'enterprise';
  requiredRole?: 'OWNER' | 'ADMIN';
  featureName?: string;
}

export const PlanGateRoute: React.FC<PlanGateRouteProps> = ({
  children,
  requiredPlan,
  requiredRole,
  featureName,
}) => {
  const { plan, isStaff } = useAuth();

  if (requiredPlan && plan === 'starter') {
    return (
      <ForbiddenView
        type="PLAN_RESTRICTION"
        title={`${featureName || 'Feature'} Locked`}
        message={`${featureName || 'This feature'} is unlocked on Growth and Enterprise plans.`}
        requiredPlan={requiredPlan}
      />
    );
  }

  if (requiredRole && isStaff) {
    return (
      <ForbiddenView
        type="ROLE_RESTRICTION"
        title={`${featureName || 'Feature'} Restricted`}
        message={`${featureName || 'This feature'} is restricted to Business Owners and Store Managers.`}
        requiredRole={requiredRole}
      />
    );
  }

  return <>{children}</>;
};
