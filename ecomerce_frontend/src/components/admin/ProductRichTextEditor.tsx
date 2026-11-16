import React, { useMemo, useState } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { BookOpen, FileText, Maximize2, Minimize2, Sparkles, Table as TableIcon, Trash2 } from 'lucide-react';

interface ProductRichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const ARTICLE_REVIEW_TEMPLATE = `<h2>1. Tổng quan & Ngôn ngữ thiết kế</h2>
<p>Sản phẩm ghi điểm mạnh mẽ ngay từ cái nhìn đầu tiên với ngôn ngữ thiết kế hiện đại, khung viền hoàn thiện tinh xảo và các góc cạnh được bo tròn tỉ mỉ, mang lại cảm giác cầm nắm vô cùng chắc chắn và đầm tay.</p>
<blockquote><p>"Một trong những sản phẩm mang tính đột phá nhất trong năm, cân bằng hoàn hảo giữa tính thẩm mỹ sang trọng và công năng sử dụng thực tế hàng ngày." — Nhận định từ Ban Biên Tập ShopNova</p></blockquote>

<h2>2. Trải nghiệm thực tế & Tính năng vượt trội</h2>
<p>Qua quá trình thử nghiệm thực tế với cường độ cao, thiết bị chứng minh độ bền bỉ cùng hiệu năng ổn định đáng kinh ngạc:</p>
<ul>
    <li><strong>Hiệu năng xử lý:</strong> Phản hồi mượt mà trong mọi tác vụ, tối ưu hóa mức tiêu thụ năng lượng thông minh.</li>
    <li><strong>Chất lượng gia công:</strong> Đạt tiêu chuẩn kiểm định khắt khe, bề mặt chống trầy xước và bám vân tay hiệu quả.</li>
    <li><strong>Khả năng tương thích:</strong> Đồng bộ nhanh chóng và mượt mà trong hệ sinh thái thiết bị thông minh.</li>
</ul>

<h2>3. Bảng thông số kỹ thuật chi tiết</h2>
<figure class="table">
    <table>
        <thead>
            <tr>
                <th>Tiêu chí</th>
                <th>Thông số kỹ thuật</th>
                <th>Mức độ đánh giá</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Chất liệu & Độ hoàn thiện</td>
                <td>Vật liệu cao cấp chuẩn công nghiệp</td>
                <td>Rất xuất sắc (9.5/10)</td>
            </tr>
            <tr>
                <td>Khả năng vận hành</td>
                <td>Ổn định liên tục trong thời gian dài</td>
                <td>Mượt mà (9.0/10)</td>
            </tr>
            <tr>
                <td>Chính sách hậu mãi</td>
                <td>Bảo hành 12 tháng chính hãng 1 đổi 1</td>
                <td>An tâm tuyệt đối (10/10)</td>
            </tr>
        </tbody>
    </table>
</figure>

<h2>4. Ưu điểm và Điểm cần lưu ý</h2>
<p><strong>Ưu điểm nổi bật:</strong> Thiết kế đẳng cấp, chất liệu cao cấp, độ bền ấn tượng và đáp ứng xuất sắc nhu cầu sử dụng khắt khe.</p>
<p><strong>Điểm cần lưu ý:</strong> Thuộc phân khúc cao cấp nên mức giá tương xứng với chất lượng và độ hoàn thiện.</p>

<h2>5. Kết luận & Nhận định chung</h2>
<p>Với những giá trị thực tế đem lại, đây chắc chắn là một khoản đầu tư hoàn toàn xứng đáng cho những khách hàng tìm kiếm sự hoàn hảo từ thẩm mỹ đến hiệu năng bền lâu.</p>`;

const SPECS_TABLE_TEMPLATE = `<h3>Bảng thông số kỹ thuật chi tiết</h3>
<figure class="table">
    <table>
        <thead>
            <tr>
                <th>Hạng mục</th>
                <th>Thông số chi tiết</th>
                <th>Ghi chú</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Thương hiệu & Xuất xứ</td>
                <td>Chính hãng phân phối tại ShopNova</td>
                <td>Đầy đủ CO/CQ</td>
            </tr>
            <tr>
                <td>Chất liệu cấu tạo</td>
                <td>Hợp kim cao cấp & Vật liệu chống va đập</td>
                <td>Đạt chuẩn an toàn quốc tế</td>
            </tr>
            <tr>
                <td>Thời gian bảo hành</td>
                <td>12 tháng chính hãng</td>
                <td>1 đổi 1 trong 30 ngày đầu</td>
            </tr>
        </tbody>
    </table>
</figure>`;

const CALLOUT_TEMPLATE = `<blockquote><p><strong>💡 Lời khuyên từ chuyên gia ShopNova:</strong> Để sản phẩm đạt độ bền và hiệu suất tối đa, quý khách nên sử dụng phụ kiện sạc cáp chính hãng đi kèm và bảo quản thiết bị ở nơi khô ráo thoáng mát.</p></blockquote>`;

export const ProductRichTextEditor: React.FC<ProductRichTextEditorProps> = ({
    value,
    onChange,
    placeholder = 'Nhập hoặc chèn bài viết đánh giá chi tiết sản phẩm theo chuẩn bài báo...',
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Tính toán số từ và thời gian đọc ước tính
    const stats = useMemo(() => {
        if (!value) return { words: 0, readTimeMinutes: 1, isArticle: false };
        // Lọc bỏ các thẻ HTML để lấy văn bản thuần
        const plainText = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        const words = plainText ? plainText.split(' ').length : 0;
        const readTimeMinutes = Math.max(1, Math.ceil(words / 180));
        return {
            words,
            readTimeMinutes,
            isArticle: words >= 100,
        };
    }, [value]);

    const handleApplyTemplate = (templateHtml: string) => {
        if (value && value.trim().length > 30) {
            const confirmed = window.confirm(
                'Thao tác này sẽ ghi đè nội dung bài viết hiện tại bằng mẫu bài báo hoàn chỉnh. Bạn có muốn tiếp tục?'
            );
            if (!confirmed) return;
        }
        onChange(templateHtml);
    };

    const handleAppendCallout = (calloutHtml: string) => {
        onChange((value || '') + '\n' + calloutHtml);
    };

    const handleClear = () => {
        if (!value) return;
        if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ nội dung bài viết?')) {
            onChange('');
        }
    };

    return (
        <div
            className={`product-rich-editor rounded-2xl border transition-all bg-white shadow-xs ${
                isExpanded
                    ? 'border-indigo-400 ring-4 ring-indigo-50/80 shadow-md'
                    : 'border-slate-200 hover:border-slate-300'
            }`}
        >
            {/* Header Toolbar: Mẫu bài báo & Công cụ mở rộng */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-3.5 py-2 rounded-t-2xl">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5 mr-1">
                        <FileText size={14} className="text-indigo-600" /> Chèn nhanh mẫu bài viết:
                    </span>
                    <button
                        type="button"
                        onClick={() => handleApplyTemplate(ARTICLE_REVIEW_TEMPLATE)}
                        title="Chèn bài báo đánh giá chi tiết với đầy đủ các phần: Thiết kế, Trải nghiệm, Bảng thông số, Ưu nhược điểm và Kết luận"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-white px-2.5 py-1 font-semibold text-indigo-700 shadow-2xs hover:bg-indigo-50 transition cursor-pointer"
                    >
                        <BookOpen size={13} className="text-indigo-600" />
                        Mẫu bài báo đánh giá
                    </button>
                    <button
                        type="button"
                        onClick={() => handleAppendCallout(SPECS_TABLE_TEMPLATE)}
                        title="Chèn bảng thông số kỹ thuật chi tiết"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 shadow-2xs hover:bg-slate-100 transition cursor-pointer"
                    >
                        <TableIcon size={13} className="text-slate-500" />
                        Bảng thông số
                    </button>
                    <button
                        type="button"
                        onClick={() => handleAppendCallout(CALLOUT_TEMPLATE)}
                        title="Chèn trích dẫn hoặc lưu ý quan trọng từ chuyên gia"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-700 shadow-2xs hover:bg-slate-100 transition cursor-pointer"
                    >
                        <Sparkles size={13} className="text-amber-500" />
                        Trích dẫn lưu ý
                    </button>
                    {value && (
                        <button
                            type="button"
                            onClick={handleClear}
                            title="Xóa toàn bộ văn bản để soạn lại"
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                            <Trash2 size={13} />
                            Xóa
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                    <button
                        type="button"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-medium text-slate-600 shadow-2xs hover:bg-slate-100 transition cursor-pointer"
                    >
                        {isExpanded ? (
                            <>
                                <Minimize2 size={13} /> Thu nhỏ khung
                            </>
                        ) : (
                            <>
                                <Maximize2 size={13} /> Mở rộng soạn bài dài
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Khung soạn thảo CKEditor */}
            <div className={`rich-editor-wrapper ${isExpanded ? 'editor-expanded' : 'editor-normal'}`}>
                <CKEditor
                    editor={ClassicEditor}
                    data={value || ''}
                    config={{
                        placeholder,
                        toolbar: [
                            'heading',
                            '|',
                            'bold',
                            'italic',
                            'link',
                            'bulletedList',
                            'numberedList',
                            '|',
                            'blockQuote',
                            'insertTable',
                            'mediaEmbed',
                            '|',
                            'undo',
                            'redo',
                        ],
                        heading: {
                            options: [
                                { model: 'paragraph', title: 'Đoạn văn (Paragraph)', class: 'ck-heading_paragraph' },
                                {
                                    model: 'heading1',
                                    view: 'h2',
                                    title: 'Tiêu đề lớn (Heading 1)',
                                    class: 'ck-heading_heading1',
                                },
                                {
                                    model: 'heading2',
                                    view: 'h3',
                                    title: 'Tiêu đề vừa (Heading 2)',
                                    class: 'ck-heading_heading2',
                                },
                                {
                                    model: 'heading3',
                                    view: 'h4',
                                    title: 'Tiêu đề nhỏ (Heading 3)',
                                    class: 'ck-heading_heading3',
                                },
                            ],
                        },
                        table: {
                            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
                        },
                    }}
                    onChange={(_event: any, editor: any) => {
                        const data = editor.getData();
                        onChange(data);
                    }}
                />
            </div>

            {/* Footer Metrics Bar: Thống kê chuẩn bài báo */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-3.5 py-1.5 rounded-b-2xl text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700">
                        Số từ: <span className="tabular-nums font-bold text-indigo-600">{stats.words}</span> từ
                    </span>
                    <span>•</span>
                    <span>
                        Thời gian đọc ước tính:{' '}
                        <span className="tabular-nums font-bold text-slate-700">~{stats.readTimeMinutes} phút</span>
                    </span>
                </div>
                <div>
                    {stats.isArticle ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-bold text-emerald-700 border border-emerald-200">
                            📰 Chuẩn bài báo chuyên sâu
                        </span>
                    ) : (
                        <span className="text-slate-400">Gợi ý: Thêm tiêu đề, trích dẫn hoặc bảng để bài viết phong phú hơn</span>
                    )}
                </div>
            </div>
        </div>
    );
};
