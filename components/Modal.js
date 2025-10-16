// /components/Modal.js
import styles from "../styles/Modal.module.css";

export default function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
