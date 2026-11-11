import { create } from "zustand";
import { loginService } from "../service/loginService";
import { cartService } from "../service/cartService";
import { useCartStore } from "./cartStore";
import { userService } from "../service/userService";

export interface AuthUser {
    id?: number;
    username: string;
    email?: string;
    fullName: string;
    avatarUrl: string | null;
    dateOfBirth?: string | number[] | null;
    gender?: string;
    role: string;
}

interface State {
    loading: boolean;
    accessToken: string;
    user: AuthUser | null;
    login: (data: { username: string; password: string }) => Promise<void>;
    refresh: () => Promise<void>;
    loadCurrentUser: () => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<State>((set) => ({
    loading: false,
    accessToken: localStorage.getItem("accessToken") || "",
    user: null,

    login: async (data) => {
        try {
            set({ loading: true });

            // Kết nối với backend API đăng nhập
            const response = await loginService.login(data);

            // Giả sử loginService trả về dữ liệu có dạng:
            // { user: AuthUser, accessToken: string }
            const { user, accessToken } = response;

            if (accessToken) {
                localStorage.setItem("accessToken", accessToken);
                localStorage.removeItem("token");
            }

            if (user) {
                try {
                    localStorage.setItem("currentUser", JSON.stringify(user));
                    const prevSaved =
                        localStorage.getItem("currentUserProfile");
                    const prevObj = prevSaved ? JSON.parse(prevSaved) : {};
                    localStorage.setItem(
                        "currentUserProfile",
                        JSON.stringify({
                            ...prevObj,
                            id: user.id ?? prevObj.id,
                            username: user.username ?? prevObj.username,
                            fullName: user.fullName ?? prevObj.fullName,
                            avatarUrl: user.avatarUrl ?? prevObj.avatarUrl,
                            dateOfBirth:
                                user.dateOfBirth ?? prevObj.dateOfBirth,
                            role: user.role ?? prevObj.role,
                            email: user.email ?? prevObj.email,
                        }),
                    );
                } catch {
                    // ignore
                }
            }

            set({
                user,
                accessToken: accessToken || "",
            });

            // Đồng bộ giỏ hàng LocalStorage với Backend sau khi đăng nhập
            const localCartItems = useCartStore.getState().items;
            if (localCartItems.length > 0) {
                try {
                    const syncItems = localCartItems.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    }));
                    const syncedCart = await cartService.sync(syncItems);
                    // Cập nhật giỏ hàng LocalStorage từ dữ liệu Backend
                    useCartStore.getState().clearCart();
                    syncedCart.items.forEach((item) => {
                        useCartStore.getState().addItem({
                            id: item.productId,
                            name: item.name,
                            price: item.price,
                            thumbnailUrl: item.thumbnailUrl,
                            stockQuantity: item.stockQuantity,
                        } as any);
                        // Cập nhật số lượng chính xác
                        useCartStore
                            .getState()
                            .updateQuantity(item.productId, item.quantity);
                    });
                } catch (error) {
                    console.error("Lỗi đồng bộ giỏ hàng:", error);
                }
            } else {
                // Nếu LocalStorage trống, lấy giỏ hàng từ Backend
                try {
                    const backendCart = await cartService.getCart();
                    useCartStore.getState().clearCart();
                    backendCart.items.forEach((item) => {
                        useCartStore.getState().addItem({
                            id: item.productId,
                            name: item.name,
                            price: item.price,
                            thumbnailUrl: item.thumbnailUrl,
                            stockQuantity: item.stockQuantity,
                        } as any);
                        useCartStore
                            .getState()
                            .updateQuantity(item.productId, item.quantity);
                    });
                } catch (error) {
                    console.error("Lỗi lấy giỏ hàng từ Backend:", error);
                }
            }
        } finally {
            set({ loading: false });
        }
    },

    loadCurrentUser: async () => {
        const token = useAuthStore.getState().accessToken;

        if (!token) {
            set({ user: null });
            return;
        }

        try {
            // Kết nối với backend API lấy thông tin người dùng hiện tại
            const response = await loginService.getCurrentUser();

            // Nếu service trả về AxiosResponse, sử dụng response.data.
            // Nếu service đã trả về user trực tiếp, sử dụng response.
            const user = response?.data?.data ?? response?.data ?? response;

            if (user) {
                try {
                    localStorage.setItem("currentUser", JSON.stringify(user));
                    const prevSaved =
                        localStorage.getItem("currentUserProfile");
                    const prevObj = prevSaved ? JSON.parse(prevSaved) : {};
                    localStorage.setItem(
                        "currentUserProfile",
                        JSON.stringify({
                            ...prevObj,
                            id: user.id ?? prevObj.id,
                            username: user.username ?? prevObj.username,
                            fullName: user.fullName ?? prevObj.fullName,
                            avatarUrl: user.avatarUrl ?? prevObj.avatarUrl,
                            dateOfBirth:
                                user.dateOfBirth ?? prevObj.dateOfBirth,
                            role: user.role ?? prevObj.role,
                            email: user.email ?? prevObj.email,
                        }),
                    );
                } catch {
                    // ignore
                }
            }

            set({ user });
        } catch {
            set({ user: null });
        }
    },

    refresh: async () => {
        try {
            set({ loading: true });
            // Kết nối với backend API làm mới token
            const response = await userService.refreshToken();
            if (response && response.accessToken) {
                localStorage.setItem("accessToken", response.accessToken);
                localStorage.removeItem("token");
                set({ accessToken: response.accessToken });
                if (response.user) {
                    set({ user: response.user });
                }
            }
        } catch (error) {
            console.error("Lỗi khi refresh token:", error);
        } finally {
            set({ loading: false });
        }
    },

    logout: async () => {
        try {
            // Kết nối với backend API đăng xuất
            await loginService.logout();
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("token");
            localStorage.removeItem("currentUser");
            localStorage.removeItem("currentUserProfile");

            set({
                user: null,
                accessToken: "",
            });
        }
    },
}));
