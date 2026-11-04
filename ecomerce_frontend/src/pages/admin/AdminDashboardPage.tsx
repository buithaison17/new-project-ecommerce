export default function AdminDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-500">Tổng đơn hàng</p>
                    <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-500">Tổng sản phẩm</p>
                    <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-500">Tổng người dùng</p>
                    <p className="text-2xl font-bold text-slate-900">0</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-slate-100">
                    <p className="text-sm text-slate-500">Doanh thu</p>
                    <p className="text-2xl font-bold text-slate-900">0đ</p>
                </div>
            </div>
        </div>
    );
}
