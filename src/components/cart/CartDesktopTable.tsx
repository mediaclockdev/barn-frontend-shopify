import Image from "next/image";
import Link from "next/link";
import { FiPlus, FiMinus } from "react-icons/fi";
import { FaTimesCircle } from "react-icons/fa";
import { HydratedCartItem } from "./CartMobileItem";

interface CartDesktopTableProps {
  hydratedCart: HydratedCartItem[];
  isLoading: boolean;
  onUpdateQuantity: (
    id: string | number,
    quantity: number,
    variation_id?: string | number,
    line_id?: string,
  ) => void;
  onRemoveItem: (
    id: string | number, 
    variation_id?: string | number,
    line_id?: string,
  ) => void;
}

const CartDesktopTable: React.FC<CartDesktopTableProps> = ({
  hydratedCart,
  isLoading,
  onUpdateQuantity,
  onRemoveItem,
}) => {
  return (
    <div className="hidden md:block overflow-x-auto bg-white rounded-2xl border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-4 text-gray-500 font-semibold w-12"></th>
            <th className="p-4 text-left text-gray-700 font-semibold">
              Product
            </th>
            <th className="p-4 text-left text-gray-700 font-semibold">
              Description
            </th>
            <th className="p-4 text-center text-gray-700 font-semibold">
              Price
            </th>
            <th className="p-4 text-center text-gray-700 font-semibold">
              Quantity
            </th>
            <th className="p-4 text-right pr-6 text-gray-700 font-semibold">
              Subtotal
            </th>
          </tr>
        </thead>

        <tbody>
          {hydratedCart.map((item) => (
            <tr
              key={`${item.product_id}-${item.variation_id || 0}`}
              className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors"
            >
              <td className="p-4 text-red-500 cursor-pointer align-middle">
                <div className="flex items-center justify-center w-full">
                  <FaTimesCircle
                    size={20}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    onClick={() =>
                      onRemoveItem(item.product_id, item.variation_id, item.line_id)
                    }
                  />
                </div>
              </td>
              <td className="p-4 flex items-center justify-center">
                <Link
                  href={item.variation_id && item.variation_id !== 0 ? `/shop/${item.slug}?variant=${item.variation_id}` : `/shop/${item.slug}`}
                  className="block border border-gray-100 rounded-lg overflow-hidden bg-white p-1"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    height={60}
                    width={60}
                    className="object-cover h-12 w-12 rounded"
                  />
                </Link>
              </td>
              <td className="p-4 text-base">
                <Link
                  href={item.variation_id && item.variation_id !== 0 ? `/shop/${item.slug}?variant=${item.variation_id}` : `/shop/${item.slug}`}
                  className="font-medium text-gray-800 hover:text-primary transition-colors"
                >
                  {item.name.replace(/&amp;/g, "and")}
                </Link>
                {item.variation_name && (
                  <p className="text-xs text-gray-500 mt-1">
                    {item.variation_name}
                  </p>
                )}
              </td>
              <td className="p-4 text-center font-medium text-gray-600 text-base">
                ${item.price.toFixed(2)} AUD
              </td>
              <td className="p-4 text-center">
                <div className="flex items-center justify-center gap-1">
                  <button
                    onClick={() =>
                      onUpdateQuantity(
                        item.product_id,
                        item.quantity - 1,
                        item.variation_id,
                        item.line_id
                      )
                    }
                    disabled={item.quantity <= 1 || isLoading}
                    className="w-8 h-8 rounded shrink-0 flex items-center justify-center bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <FiMinus />
                  </button>

                  <span className="w-8 text-center font-semibold text-gray-800">
                    {item.quantity}
                  </span>

                  <button
                    onClick={() =>
                      onUpdateQuantity(
                        item.product_id,
                        item.quantity + 1,
                        item.variation_id,
                        item.line_id
                      )
                    }
                    disabled={
                      item.quantity >= Math.min(item.maxQuantity ?? 50, 50) || isLoading
                    }
                    className="w-8 h-8 rounded shrink-0 flex items-center justify-center bg-gray-100 text-gray-600 disabled:opacity-50 hover:bg-gray-200 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    <FiPlus />
                  </button>
                </div>
              </td>
              <td className="p-4 text-right pr-6 font-semibold text-primary text-base">
                ${(item.price * item.quantity).toFixed(2)} AUD
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CartDesktopTable;
