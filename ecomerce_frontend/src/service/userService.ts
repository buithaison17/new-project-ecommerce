import { api } from "../lib/axios";
import { useAuthStore } from "../store/authStore";

export interface UserProfile {
    id: number;
    username: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    dateOfBirth: string;
    gender: string;
    role: string;
}

export interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
}

interface BackendUserRegisterResponse {
    user?: {
        id: number;
        username: string;
        email: string;
        role: string;
    };
    userInformation?: {
        id: number;
        fullName: string;
        avatarUrl: string | null;
        dateOfBirth: string | number[] | null;
        gender: string;
    };
}

export function normalizeDate(date: any): string {
    if (!date) return "";

    // Array format from Jackson: [year, month, day] e.g. [2006, 1, 17]
    if (Array.isArray(date)) {
        if (date.length >= 3) {
            const y = String(date[0]).padStart(4, "0");
            const m = String(date[1]).padStart(2, "0");
            const d = String(date[2]).padStart(2, "0");
            return `${y}-${m}-${d}`;
        }
    }

    const str = String(date).trim();
    if (!str || str === "null" || str === "undefined") return "";

    // Comma-separated string e.g. "2006,1,17" or "2006, 1, 17"
    if (str.includes(",")) {
        const parts = str.split(",").map((p) => p.trim());
        if (parts.length >= 3) {
            const y = parts[0].padStart(4, "0");
            const m = parts[1].padStart(2, "0");
            const d = parts[2].padStart(2, "0");
            return `${y}-${m}-${d}`;
        }
    }

    // ISO format: YYYY-MM-DD or YYYY-M-D or YYYY/MM/DD
    const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
    if (isoMatch) {
        const [, y, m, d] = isoMatch;
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    // DMY format: DD-MM-YYYY or D/M/YYYY (e.g. 17/01/2006)
    const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (dmyMatch) {
        const [, d, m, y] = dmyMatch;
        return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }

    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, "0");
        const d = String(parsed.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    }

    return "";
}

const PROFILE_CACHE_KEY = "currentUserProfile";

export const userService = {
    async getCurrentUser(): Promise<UserProfile> {
        let rawUser: any = null;
        try {
            const res = await api.get("/users/me");
            rawUser = res.data?.data ?? res.data;
        } catch {
            const res = await api.get("/auth/me");
            rawUser = res.data?.data ?? res.data;
        }

        const authUser: any = useAuthStore.getState().user;

        let cached: Partial<UserProfile> = {};
        try {
            const saved = localStorage.getItem(PROFILE_CACHE_KEY);
            if (saved) {
                cached = JSON.parse(saved);
            }
        } catch {
            // bỏ qua lỗi parse json
        }

        const currentUsername = rawUser?.username || authUser?.username || "";
        const isSameUser =
            !cached.username ||
            (currentUsername && cached.username === currentUsername);

        const rawDate =
            rawUser?.dateOfBirth ??
            authUser?.dateOfBirth ??
            (isSameUser ? cached.dateOfBirth : "") ??
            "";
        const formattedDate = normalizeDate(rawDate);

        const email =
            rawUser?.email ||
            authUser?.email ||
            (isSameUser ? cached.email : "") ||
            (currentUsername?.includes("@") ? currentUsername : "") ||
            "";

        const profile: UserProfile = {
            id:
                rawUser?.id ??
                authUser?.id ??
                (isSameUser ? cached.id : 0) ??
                0,
            username:
                currentUsername || (isSameUser ? cached.username : "") || "",
            email,
            fullName:
                rawUser?.fullName ||
                authUser?.fullName ||
                (isSameUser ? cached.fullName : "") ||
                currentUsername ||
                "",
            avatarUrl:
                rawUser?.avatarUrl ??
                authUser?.avatarUrl ??
                (isSameUser ? cached.avatarUrl : null) ??
                null,
            dateOfBirth: formattedDate,
            gender:
                rawUser?.gender ||
                authUser?.gender ||
                (isSameUser ? cached.gender : "MALE") ||
                "MALE",
            role:
                rawUser?.role ||
                authUser?.role ||
                (isSameUser ? cached.role : "CUSTOMER") ||
                "CUSTOMER",
        };

        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile));
        return profile;
    },

    async updateProfile(data: FormData): Promise<UserProfile> {
        const response = await api.patch<{
            success: boolean;
            message: string;
            data: BackendUserRegisterResponse;
        }>("/users", data, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        const payload = response.data?.data;
        const userObj = payload?.user;
        const userInfoObj = payload?.userInformation;

        let prevCached: Partial<UserProfile> = {};
        try {
            const saved = localStorage.getItem(PROFILE_CACHE_KEY);
            if (saved) prevCached = JSON.parse(saved);
        } catch {
            // bỏ qua lỗi parse json
        }

        const rawUpdatedDate =
            userInfoObj?.dateOfBirth ?? prevCached.dateOfBirth ?? "";
        const formattedUpdatedDate = normalizeDate(rawUpdatedDate);

        const updatedProfile: UserProfile = {
            id: userObj?.id ?? userInfoObj?.id ?? prevCached.id ?? 0,
            username: userObj?.username ?? prevCached.username ?? "",
            email: userObj?.email ?? prevCached.email ?? "",
            fullName: userInfoObj?.fullName ?? prevCached.fullName ?? "",
            avatarUrl: userInfoObj?.avatarUrl ?? prevCached.avatarUrl ?? null,
            dateOfBirth: formattedUpdatedDate,
            gender: userInfoObj?.gender ?? prevCached.gender ?? "MALE",
            role: userObj?.role ?? prevCached.role ?? "CUSTOMER",
        };

        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(updatedProfile));
        return updatedProfile;
    },

    async changePassword(data: ChangePasswordRequest) {
        return (await api.patch("/users/change-password", data)).data;
    },

    async refreshToken() {
        const response = await api.post("/auth/refresh");
        return response.data;
    },
};
