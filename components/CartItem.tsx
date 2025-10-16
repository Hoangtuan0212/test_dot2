// components/CartItem.tsx
import { useCart } from "../context/CartContext";

interface CartItemProps {
  id: number;
  productTitle: string;
  productPrice: number;
  productThumbnail: string;
  quantity: number;
}

const CartItem = ({
  id,
  productTitle,
  productPrice,
  productThumbnail,
  quantity,
}: CartItemProps) => {
  const { updateCartItem, removeCartItem } = useCart();

  return (
    <div className="flex items-center border-b pb-2">
      <img
        src={productThumbnail}
        alt={productTitle}
        className="w-16 h-16 object-cover rounded"
      />
      <div className="ml-4 flex-1">
        <p className="font-semibold">{productTitle}</p>
        <p className="text-sm">{productPrice.toLocaleString()}đ</p>

        <div className="flex items-center mt-2">
          <button
            className="border px-2"
            onClick={() => updateCartItem(id, quantity - 1)}
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="mx-2">{quantity}</span>
          <button
            className="border px-2"
            onClick={() => updateCartItem(id, quantity + 1)}
          >
            +
          </button>
        </div>
      </div>

      <button className="text-red-500 ml-4" onClick={() => removeCartItem(id)}>
        ❌
      </button>
    </div>
  );
};

export default CartItem;
