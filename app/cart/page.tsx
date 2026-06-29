import AddToCart from "@/src/components/cart/AddToCart";
import BreadCrumb from "@/src/components/misc/BreadCrumb";

const page = () => {
  return (
    <div>
      <BreadCrumb />
      <AddToCart />
    </div>
  );
};

export default page;
