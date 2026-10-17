import { AppReleaseModel, IAppRelease, IFeatureHighlight } from '../model';

export const DEFAULT_APP_RELEASE: {
  version: string;
  releaseDate: string;
  channel: string;
  title: string;
  subtitle: string;
  features: IFeatureHighlight[];
} = {
  version: '1.1.2',
  releaseDate: '17 Oct 2026',
  channel: 'preview',
  title: 'New Features in Vyora',
  subtitle: "Here is what we've added to boost your store productivity:",
  features: [
    {
      id: '1-tap-cash',
      icon: 'payments',
      title: '1-Tap Counter Cash Sale',
      description: 'Create GST bills and instantly settle counter cash payments in a single tap.',
      badge: 'NEW',
      order: 1,
    },
    {
      id: 'quick-collect',
      icon: 'account-balance-wallet',
      title: '1-Tap Udhaar Collect ₹',
      description: 'Collect outstanding party dues directly from customer ledger cards with zero extra clicks.',
      badge: 'NEW',
      order: 2,
    },
    {
      id: 'multi-store',
      icon: 'store',
      title: 'Multi-Store Switcher & Branch Creation',
      description: 'Seamlessly add and switch between multiple store branches without logging out.',
      badge: 'PRO',
      order: 3,
    },
    {
      id: 'staff-roles',
      icon: 'shield',
      title: 'Staff Margin Shield & Rights',
      description: 'Purchase prices and sensitive profit margins are safely masked from billing staff.',
      order: 4,
    },
    {
      id: 'upi-renew',
      icon: 'qr-code-2',
      title: 'Bharat UPI Store Renewal',
      description: 'Store owners can renew subscription plans directly with zero gateway delay.',
      order: 5,
    },
  ],
};

export class AppReleaseService {
  /**
   * Retrieves the latest active release notes and feature highlights.
   * If none exists in MongoDB yet, automatically initializes and returns the default release.
   */
  static async getLatestRelease(): Promise<{
    version: string;
    releaseDate: string;
    channel: string;
    title: string;
    subtitle: string;
    features: IFeatureHighlight[];
  }> {
    try {
      let release = await AppReleaseModel.findOne({ isActive: true })
        .sort({ createdAt: -1 })
        .lean();

      if (!release) {
        // Auto-seed default release into database for easy future modification
        try {
          const created = await AppReleaseModel.create({
            ...DEFAULT_APP_RELEASE,
            isActive: true,
          });
          return {
            version: created.version,
            releaseDate: created.releaseDate,
            channel: created.channel,
            title: created.title,
            subtitle: created.subtitle,
            features: created.features,
          };
        } catch {
          return DEFAULT_APP_RELEASE;
        }
      }

      return {
        version: release.version,
        releaseDate: release.releaseDate,
        channel: release.channel || 'preview',
        title: release.title || DEFAULT_APP_RELEASE.title,
        subtitle: release.subtitle || DEFAULT_APP_RELEASE.subtitle,
        features: release.features || DEFAULT_APP_RELEASE.features,
      };
    } catch {
      return DEFAULT_APP_RELEASE;
    }
  }

  /**
   * Publishes or updates release notes and dynamic feature highlights.
   */
  static async publishRelease(data: {
    version: string;
    releaseDate?: string;
    channel?: string;
    title?: string;
    subtitle?: string;
    features: IFeatureHighlight[];
    setActive?: boolean;
  }): Promise<IAppRelease> {
    if (data.setActive !== false) {
      // Deactivate older active releases
      await AppReleaseModel.updateMany({ isActive: true }, { isActive: false });
    }

    const newRelease = await AppReleaseModel.create({
      version: data.version,
      releaseDate: data.releaseDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      channel: data.channel || 'preview',
      title: data.title || DEFAULT_APP_RELEASE.title,
      subtitle: data.subtitle || DEFAULT_APP_RELEASE.subtitle,
      features: data.features,
      isActive: data.setActive !== false,
    });

    return newRelease;
  }
}
