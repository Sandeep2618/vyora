import { LucideIcon } from 'lucide-react';

export interface ModuleRightItem {
  key: string;
  title: string;
  desc: string;
  icon: LucideIcon;
}

export interface ModuleRightsMatrixProps {
  permissions: Record<string, boolean>;
  isOwner: boolean;
  onTogglePermission: (moduleKey: string) => void;
}
