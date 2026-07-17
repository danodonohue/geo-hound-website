import { SELLER_NAME, SELLER_NAME_CONFIRMED } from '@/lib/constants';
import styles from './SellerName.module.css';

/**
 * The legal seller identity, for use in prose.
 *
 * While unconfirmed it renders in danger colours so the placeholder is
 * impossible to miss on the page. A legal identity that ships looking
 * plausible but wrong is the failure worth designing against, and /terms is
 * exactly where that would happen.
 */
export function SellerName() {
  if (SELLER_NAME_CONFIRMED) {
    return <strong>{SELLER_NAME}</strong>;
  }
  return (
    <strong className={styles.pending} title="Placeholder: the owner must confirm the legal entity">
      {SELLER_NAME}
    </strong>
  );
}
