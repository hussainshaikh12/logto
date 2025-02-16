import { diff } from 'deep-object-diff';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import PlanName from '@/components/PlanName';
import { isDevFeaturesEnabled } from '@/consts/env';
import { type SubscriptionPlan } from '@/types/subscriptions';

import PlanQuotaDiffCard from './PlanQuotaDiffCard';
import * as styles from './index.module.scss';

type Props = {
  currentPlan: SubscriptionPlan;
  targetPlan: SubscriptionPlan;
};

function DowngradeConfirmModalContent({ currentPlan, targetPlan }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    quota: currentFullQuota,
    quota: { mfaEnabled: currentMfaEnabled, ...currentQuotaWithoutMfa },
    name: currentPlanName,
  } = currentPlan;
  const currentQuota = isDevFeaturesEnabled ? currentFullQuota : currentQuotaWithoutMfa;

  const {
    quota: targetFullQuota,
    quota: { mfaEnabled: targetMfaEnabled, ...targetQuotaWithoutMfa },
    name: targetPlanName,
  } = targetPlan;
  const targetQuota = isDevFeaturesEnabled ? targetFullQuota : targetQuotaWithoutMfa;

  const currentQuotaDiff = useMemo(
    () => diff(targetQuota, currentQuota),
    [currentQuota, targetQuota]
  );

  const targetQuotaDiff = useMemo(
    () => diff(currentQuota, targetQuota),
    [currentQuota, targetQuota]
  );

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <Trans
          components={{
            targetName: <PlanName name={targetPlanName} />,
            currentName: <PlanName name={currentPlanName} />,
          }}
        >
          {t('subscription.downgrade_modal.description')}
        </Trans>
      </div>
      <div className={styles.content}>
        <PlanQuotaDiffCard planName={currentPlanName} quotaDiff={currentQuotaDiff} />
        <PlanQuotaDiffCard isTarget planName={targetPlanName} quotaDiff={targetQuotaDiff} />
      </div>
    </div>
  );
}

export default DowngradeConfirmModalContent;
