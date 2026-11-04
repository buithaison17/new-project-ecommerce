import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCartStore } from "../store/cartStore";

export default function CartButton() {
    const itemCount = useCartStore((state) =>
        state.items.reduce((total, item) => total + item.quantity, 0)
    );

    return (
        <Link
            to="/cart"
            className="group relative inline-flex items-center justify-center rounded-xl p-2.5 text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label={`Giỏ hàng có ${itemCount} sản phẩm`}
            title="Giỏ hàng của bạn"
        >
            <ShoppingCart
                size={22}
                className="transition duration-200 group-hover:scale-110"
            />
            {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1 text-[11px] font-black text-white shadow-sm ring-2 ring-white animate-in zoom-in-50 duration-200">
                    {itemCount > 99 ? "99+" : itemCount}
                </span>
            )}
        </Link>
    );
}
