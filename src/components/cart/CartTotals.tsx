"use client";

import Image from "next/image";
import Button from "../ui/Button";
import { FaLock } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/src/store/cartStore";

interface CartTotalsProps {
  subTotal: number;
  isCartEmpty: boolean;
}

const CartTotals: React.FC<CartTotalsProps> = ({ subTotal, isCartEmpty }) => {
  const router = useRouter();
  const shippingCost = useCartStore((state) => state.shippingCost);
  const checkoutUrl = useCartStore((state) => state.checkoutUrl);

  const checkoutDisabled = isCartEmpty || !checkoutUrl;

  const handleCheckout = () => {
    if (!checkoutDisabled && checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  return (
    <div className="w-full max-w-[480px] lg:max-w-full lg:w-full bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-sky-400 to-primary"></div>

      <h3 className="text-2xl font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-5">
        Order Summary
      </h3>

      <div className="flex flex-col">
        {/* Subtotal */}
        <div className="flex justify-between items-center py-4 border-b border-gray-50">
          <span className="text-gray-600 font-medium">Subtotal</span>
          <span className="text-gray-900 font-bold">
            ${subTotal.toFixed(2)} AUD
          </span>
        </div>

        {/* Shipping Note */}
        <div className="flex justify-between items-center py-4 border-b border-gray-50">
          <span className="text-gray-600 font-medium">Shipping</span>
          {shippingCost ? (
            <span className="text-gray-900 font-bold">
              ${shippingCost.toFixed(2)} AUD
            </span>
          ) : (
            <span className="text-gray-500 text-sm italic font-medium text-right max-w-[150px]">
              Calculated at checkout
            </span>
          )}
        </div>



        {/* Total (Using Subtotal + Shipping if available) */}
        <div className="flex justify-between items-end py-6 mt-2">
          <span className="text-xl font-bold text-gray-900">Total</span>
          <div className="text-right">
            <span className="text-4xl font-black text-primary tracking-tight">
              ${Math.max(0, subTotal + (shippingCost || 0)).toFixed(2)}
            </span>
            <span className="text-gray-400 font-semibold ml-1 text-base">
              AUD
            </span>
          </div>
        </div>
      </div>

      {/* Checkout Button */}
      <div className="mt-4 relative">
        <p className="text-sm text-gray-500 text-center mb-4 px-2">
          * Please note: Shipping costs will be calculated on the checkout page.
        </p>
        <Button
          onClick={handleCheckout}
          text={"Checkout"}
          icon={FaLock}
          className={`w-full justify-center py-3 text-lg rounded-lg font-bold shadow-[0_8px_20px_rgb(14,165,233,0.25)] transition-all duration-300 ${checkoutDisabled ? "bg-gray-200 text-gray-400 shadow-none hover:bg-gray-200 cursor-not-allowed pointer-events-none" : "hover:-translate-y-1 hover:shadow-[0_12px_25px_rgb(14,165,233,0.35)]"}`}
          disabled={checkoutDisabled}
        />
      </div>

      {/* Trust & Payment Icons */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-center text-xs text-gray-400 font-medium mb-4 uppercase tracking-widest">
          Guaranteed Safe Checkout
        </p>
        <div className="flex gap-4 flex-wrap items-center justify-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
          <Image
            src={"/images/payment/pay1.svg"}
            alt="Gpay"
            width={55}
            height={25}
            className="object-contain"
          />
          <Image
            src={"/images/payment/paypal.svg"}
            alt="PayPal"
            width={85}
            height={25}
            className="object-contain hover:scale-105 transition-transform"
          />
          <Image
            src={"/images/payment/pay4.svg"}
            alt="ShopPay"
            width={85}
            height={25}
            className="object-contain hover:scale-105 transition-transform"
          />
        </div>
      </div>
    </div>
  );
};

export default CartTotals;
