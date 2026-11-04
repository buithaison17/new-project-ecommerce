import { useParams } from "react-router-dom";

export default function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-100">
                <h1 className="mb-2 text-2xl font-bold text-slate-900">Chi tiết sản phẩm</h1>
                <p className="text-slate-500">ID: {id}</p>
                <p className="text-slate-500">Đang tải thông tin sản phẩm...</p>
            </div>
        </div>
    );
}
