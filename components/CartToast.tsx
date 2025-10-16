// components/CartToast.tsx
import React, { useEffect } from "react";

interface CartToastProps {
  message: string;
  onClose: () => void;
}

const CartToast: React.FC<CartToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background: "green",
        color: "#fff",
        padding: "10px 16px",
        borderRadius: "4px",
        zIndex: 9999,
      }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          marginLeft: "8px",
          background: "transparent",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          fontSize: "16px",
        }}
      >
        &times;
      </button>
    </div>
  );
};

export default CartToast;
