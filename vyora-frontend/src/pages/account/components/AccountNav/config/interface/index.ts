import { AccountTabKey } from '@/pages/account/config';

export interface AccountNavProps {
  activeTab: AccountTabKey;
  onTabChange: (tab: AccountTabKey) => void;
}
