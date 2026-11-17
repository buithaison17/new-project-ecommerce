-- ==============================================================
-- DỮ LIỆU MẪU ĐA NGÀNH HÀNG CHO DỰ ÁN SHOPNOVA E-COMMERCE
-- Hệ thống bao gồm 20 danh mục chính và 77 sản phẩm phong phú
-- Tích hợp mô tả định dạng chuẩn HTML CKEditor
-- ==============================================================

-- 1. DANH MỤC SẢN PHẨM (CATEGORIES)
INSERT INTO categories (id, name, description, is_deleted, created_at, updated_at) VALUES
(1, 'Điện thoại', 'Điện thoại thông minh, máy tính bảng hàng đầu', 0, NOW(), NOW()),
(2, 'Laptop', 'Máy tính xách tay văn phòng, đồ họa, gaming', 0, NOW(), NOW()),
(3, 'Phụ kiện', 'Tai nghe, cáp sạc, bàn phím, chuột và thiết bị ngoại vi', 0, NOW(), NOW()),
(4, 'Thời trang Nam', 'Trang phục nam hiện đại, phong cách lịch lãm và năng động', 0, NOW(), NOW()),
(5, 'Thời trang Nữ', 'Váy đầm, áo kiểu thời thượng tôn vinh nét đẹp phái nữ', 0, NOW(), NOW()),
(6, 'Đồng hồ & Trang sức', 'Đồng hồ cao cấp, smartwatch và trang sức tinh tế', 0, NOW(), NOW()),
(7, 'Mỹ phẩm & Làm đẹp', 'Chăm sóc da mặt chuyên sâu, mỹ phẩm trang điểm và nước hoa chính hãng', 0, NOW(), NOW()),
(8, 'Thiết bị điện gia dụng', 'Nồi chiên, máy hút bụi, máy lọc không khí và đồ gia dụng thông minh', 0, NOW(), NOW()),
(9, 'Nhà cửa & Đời sống', 'Nội thất, chăn ga gối đệm, bình giữ nhiệt và đồ dùng gia đình tiện ích', 0, NOW(), NOW()),
(10, 'Bách hóa & Thực phẩm', 'Cà phê sạch, trà thơm, bánh kẹo và nông sản dinh dưỡng đặc sản', 0, NOW(), NOW()),
(11, 'Thể thao & Dã ngoại', 'Dụng cụ thể hình, yoga, giày thể thao và lều trại dã ngoại', 0, NOW(), NOW()),
(12, 'Mẹ & Bé', 'Sữa bột dinh dưỡng, tã bỉm siêu thấm, xe đẩy và đồ chơi trẻ em', 0, NOW(), NOW()),
(13, 'Sách & Văn phòng phẩm', 'Sách bán chạy, máy đọc sách điện tử, bút ký và văn phòng phẩm cao cấp', 0, NOW(), NOW()),
(14, 'Màn hình & PC Máy tính', 'Màn hình gaming, đồ họa 4K sắc nét, linh kiện máy tính và dàn máy PC', 0, NOW(), NOW()),
(15, 'Máy ảnh & Quay phim', 'Máy ảnh mirrorless, ống kính cao cấp, gimbal chống rung và flycam', 0, NOW(), NOW()),
(16, 'Thiết bị thông minh SmartHome', 'Khóa cửa thông minh, robot hút bụi lau sàn, camera an ninh và cảm biến IoT', 0, NOW(), NOW()),
(17, 'Âm thanh & Loa đỉnh cao', 'Loa Bluetooth di động, soundbar rạp hát tại gia, tai nghe hi-fi và micro thu âm', 0, NOW(), NOW()),
(18, 'Nội thất & Bàn ghế công thái học', 'Bàn nâng hạ tự động thông minh, ghế công thái học bảo vệ cột sống và kệ decor', 0, NOW(), NOW()),
(19, 'Thời trang Thể thao & Sneaker', 'Giày chạy bộ công nghệ mới, áo quần tập gym thoáng khí và phụ kiện thể thao', 0, NOW(), NOW()),
(20, 'Phụ kiện Ô tô & Xe máy', 'Camera hành trình siêu nét, bơm lốp điện tử, tẩu sạc xe hơi và giá đỡ điện thoại', 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- 2. SẢN PHẨM (PRODUCTS) VỚI MÔ TẢ HTML PHONG PHÚ CHUẨN CKEDITOR
INSERT INTO products (id, name, description, price, category_id, is_deleted, created_at, updated_at) VALUES
-- 1. Điện thoại
(1, 'Điện thoại Galaxy A55 5G', '<p><strong>Galaxy A55 5G</strong> mang đến sự kết hợp hoàn hảo giữa thiết kế kim loại cao cấp và hiệu năng mạnh mẽ vượt bậc trong phân khúc.</p><h3>Đặc điểm nổi bật:</h3><ul><li><strong>Màn hình:</strong> 6.6 inch Super AMOLED FHD+ 120Hz mượt mà, độ sáng cao ngoài trời.</li><li><strong>Camera:</strong> 50MP chống rung quang học OIS chụp đêm cực nét.</li><li><strong>Hiệu năng:</strong> Chip Exynos 1480 4nm tối ưu hóa pin và đồ họa.</li><li><strong>Kháng nước & bụi:</strong> Chuẩn IP67 an tâm sử dụng hàng ngày.</li></ul><blockquote><p>Sản phẩm chính hãng được bảo hành 12 tháng tại các trung tâm ủy quyền toàn quốc.</p></blockquote>', 9990000.00, 1, 0, NOW(), NOW()),

(2, 'iPhone 15 128GB', '<p><strong>iPhone 15</strong> sở hữu diện mạo đột phá với mặt lưng kính pha màu mờ sang trọng và màn hình Dynamic Island tương tác thông minh.</p><h3>Tính năng vượt trội:</h3><ul><li><strong>Camera 48MP:</strong> Độ phân giải siêu cao bắt trọn từng khoảnh khắc đáng nhớ.</li><li><strong>Cổng USB-C:</strong> Tiện lợi sạc chung một chuẩn cáp cho cả iPhone, Mac và iPad.</li><li><strong>Chip A16 Bionic:</strong> Tốc độ xử lý ấn tượng và tiết kiệm năng lượng tối đa.</li></ul><p>Thích hợp cho người dùng cần sự gọn nhẹ, bền bỉ và đẳng cấp hệ sinh thái Apple.</p>', 19990000.00, 1, 0, NOW(), NOW()),

(3, 'iPhone 15 Pro Max 256GB Titan Tự Nhiên', '<h2>1. Đỉnh cao thiết kế khung viền Titan chuẩn hàng không vũ trụ</h2><p>iPhone 15 Pro Max đánh dấu bước chuyển mình lớn nhất về kỹ nghệ chế tác phần cứng của Apple trong suốt nhiều năm qua. Thay vì thép không gỉ sáng bóng dễ bám vân tay, thiết bị sử dụng hợp kim Titan cấp độ 5 – loại vật liệu siêu bền nhẹ thường được dùng trên các tàu thám hiểm vũ trụ.</p><blockquote><p>"Khung viền Titan mới giúp iPhone 15 Pro Max giảm trọng lượng đáng kể chỉ còn 221 gram, các cạnh viền được bo cong mềm mại giúp cảm giác cầm nắm đầm tay và không hề cấn tay khi sử dụng lâu." — Nhận định từ Ban Biên Tập ShopNova Tech Lab</p></blockquote><h2>2. Vi xử lý Apple A17 Pro: Kỷ nguyên mới của đồ họa di động</h2><p>Được xây dựng trên tiến trình 3 nanomet tiên phong, chip <strong>A17 Pro</strong> trang bị bộ xử lý đồ họa GPU 6 nhân hoàn toàn mới với công nghệ dò tia Ray Tracing tăng tốc phần cứng. Điều này cho phép điện thoại xử lý mượt mà các tựa game hạng nặng chuẩn Console AAA như <em>Resident Evil Village</em> và <em>Death Stranding</em> với hiệu ứng ánh sáng đổ bóng chân thực đến từng chi tiết.</p><ul><li><strong>Hiệu năng CPU:</strong> 6 nhân mạnh hơn 10% với các cải tiến về vi kiến trúc và tốc độ tính toán.</li><li><strong>Neural Engine 16 nhân:</strong> Xử lý nhanh gấp 2 lần đối với các tác vụ học máy và AI trên thiết bị.</li><li><strong>Cổng kết nối USB-C chuẩn USB 3:</strong> Cho tốc độ truyền tải dữ liệu siêu tốc lên tới 10Gb/s, giúp các nhà làm phim xuất video ProRes 4K 60fps trực tiếp vào ổ cứng ngoài.</li></ul><h2>3. Hệ thống Camera tiềm vọng 5x: Đỉnh cao nhiếp ảnh điện ảnh</h2><p>Lần đầu tiên trên dòng iPhone, Apple trang bị thiết kế lăng kính tetraprism gập ánh sáng 4 lần, mang lại khả năng zoom quang học 5x tại tiêu cự tương đương 120mm mà không làm tăng độ dày của máy. Cảm biến chính 48MP cho phép chụp ảnh ở độ phân giải siêu nét mặc định 24MP với dải tương phản động và màu da cực kỳ chân thực.</p><h2>4. Bảng so sánh thông số kỹ thuật chi tiết</h2><figure class="table"><table><thead><tr><th>Thông số kỹ thuật</th><th>iPhone 15 Pro Max</th><th>iPhone 14 Pro Max</th><th>Đánh giá nâng cấp</th></tr></thead><tbody><tr><td>Chất liệu khung viền</td><td>Titanium Grade 5 nhám mờ</td><td>Thép không gỉ bóng</td><td>Nhẹ hơn 19g, bền bỉ và ít bám vân tay</td></tr><tr><td>Vi xử lý (SoC)</td><td>Apple A17 Pro (3nm)</td><td>Apple A16 Bionic (4nm)</td><td>Ray Tracing phần cứng, đồ họa console</td></tr><tr><td>Ống kính Telephoto</td><td>Zoom quang học 5x (120mm)</td><td>Zoom quang học 3x (77mm)</td><td>Chụp chân dung tầm xa ấn tượng</td></tr><tr><td>Cổng truyền dữ liệu</td><td>USB-C (USB 3 tốc độ 10Gb/s)</td><td>Lightning (USB 2 480Mb/s)</td><td>Nhanh hơn gấp 20 lần</td></tr><tr><td>Thời lượng pin</td><td>Lên đến 29 giờ phát video</td><td>Lên đến 29 giờ</td><td>Tối ưu nhiệt lượng mát hơn đáng kể</td></tr></tbody></table></figure><h2>5. Tổng kết ưu điểm & Đánh giá chọn mua</h2><p><strong>Ưu điểm vượt trội:</strong> Thiết kế Titan nhẹ và sang trọng vượt bậc, camera zoom 5x sắc nét, cổng USB-C tiện dụng đa năng cùng hiệu năng đỉnh cao trường tồn nhiều năm.</p><p><strong>Điểm cần lưu ý:</strong> Kích thước 6.7 inch tương đối lớn đối với người có bàn tay nhỏ, mức giá ở phân khúc cao cấp nhất hiện nay.</p><p><strong>Lời khuyên từ chuyên gia:</strong> Nếu bạn đang tìm kiếm chiếc smartphone hoàn hảo nhất từ hệ sinh thái Apple phục vụ cho công việc, sáng tạo video chất lượng cao và trải nghiệm giải trí không giới hạn, iPhone 15 Pro Max là sự lựa chọn không có đối thủ.</p>', 29490000.00, 1, 0, NOW(), NOW()),

(4, 'Samsung Galaxy S24 Ultra 512GB AI Phone', '<h2>1. Mở màn kỷ nguyên Trí tuệ nhân tạo Galaxy AI</h2><p>Samsung Galaxy S24 Ultra không chỉ là bản nâng cấp phần cứng thông thường mà là cuộc cách mạng toàn diện trong cách con người tương tác với điện thoại di động thông qua bộ công cụ <strong>Galaxy AI</strong> quyền năng.</p><blockquote><p>"Tính năng Khoanh tròn để tìm kiếm (Circle to Search) cùng Trợ lý dịch thuật cuộc gọi trực tiếp hai chiều theo thời gian thực (Live Translate) đã định nghĩa lại khái niệm về một chiếc smartphone thông minh thực thụ." — Đánh giá chuyên sâu từ Chuyên gia Công nghệ</p></blockquote><h2>2. Thiết kế phẳng vuông vức cùng khung viền Titanium sang trọng</h2><p>Khác biệt với thế hệ tiền nhiệm, màn hình của S24 Ultra đã được vát phẳng hoàn toàn, tối ưu diện tích hiển thị và hạn chế tối đa hiện tượng chạm nhầm khi viết vẽ bằng bút S-Pen. Lớp kính phủ <strong>Corning Gorilla Armor</strong> độc quyền giảm độ phản quang lên tới 75%, giúp nội dung hiển thị trong trẻo rõ ràng ngay cả dưới ánh nắng gắt trực tiếp.</p><ul><li><strong>Màn hình:</strong> 6.8 inch Dynamic AMOLED 2X độ sáng đỉnh 2600 nits, tần số quét thích ứng 1-120Hz.</li><li><strong>Bút S-Pen tích hợp:</strong> Trợ thủ đắc lực cho ghi chú nhanh, phác thảo ý tưởng và ký số tài liệu từ xa.</li><li><strong>Cấu hình khủng:</strong> Snapdragon 8 Gen 3 for Galaxy tối ưu hóa tản nhiệt buồng hơi Vapor Chamber lớn hơn 1.9 lần.</li></ul><h2>3. Hệ thống Camera mắt thần 200MP kết hợp ProVisual Engine</h2><p>Camera chính 200MP bắt trọn từng chi tiết nhỏ nhất trong khung hình, kết hợp cùng ống kính quang học 50MP zoom 5x chất lượng tương đương 10x quang học, mang lại độ sắc nét hoàn hảo khi chụp sân khấu biểu diễn hay phong cảnh đường phố.</p><h2>4. Bảng thông số kỹ thuật tiêu chuẩn</h2><figure class="table"><table><thead><tr><th>Tiêu chí</th><th>Thông số chi tiết</th><th>Đánh giá trải nghiệm</th></tr></thead><tbody><tr><td>Màn hình hiển thị</td><td>6.8 inch 2K+ Dynamic AMOLED 2X (2600 nits)</td><td>Chống lóa đỉnh nhất thị trường</td></tr><tr><td>Bộ vi xử lý</td><td>Qualcomm Snapdragon 8 Gen 3 for Galaxy</td><td>Cực kỳ mạnh mẽ và ổn định</td></tr><tr><td>Camera chính</td><td>200MP OIS + 50MP Zoom 5x + 10MP Zoom 3x + 12MP Ultra-wide</td><td>Đỉnh cao zoom và chụp đêm</td></tr><tr><td>Dung lượng Pin & Sạc</td><td>5000 mAh, sạc nhanh 45W có dây</td><td>Dùng thoải mái trọn vẹn cả ngày dài</td></tr><tr><td>Hỗ trợ cập nhật phần mềm</td><td>Cam kết 7 năm cập nhật Android & Bảo mật</td><td>Giá trị sử dụng bền bỉ lâu dài</td></tr></tbody></table></figure><h2>5. Nhận định chung</h2><p>Galaxy S24 Ultra xứng đáng là chiếc điện thoại Android toàn diện nhất năm với sự kết hợp đỉnh cao giữa trí tuệ nhân tạo, camera siêu zoom và bút stylus độc nhất vô nhị trên thị trường.</p>', 31990000.00, 1, 0, NOW(), NOW()),

(5, 'Xiaomi 14 Ultra 5G Leica Camera', '<p>Kiệt tác nhiếp ảnh di động đồng chế tác cùng huyền thoại <strong>Leica</strong> Đức, đem lại chất ảnh điện ảnh đặc trưng.</p><ul><li>4 camera sau cảm biến 1 inch khẩu độ vô cấp mượt mà.</li><li>Chip Snapdragon 8 Gen 3 cực kỳ mạnh mẽ cho mọi tác vụ nặng.</li><li>Pin 5000mAh sạc nhanh HyperCharge 90W có dây và 80W không dây.</li></ul>', 26490000.00, 1, 0, NOW(), NOW()),

(6, 'iPad Air 11 inch M2 Wi-Fi 128GB', '<p>Hiệu năng siêu việt từ chip Apple M2 cùng thiết kế siêu mỏng nhẹ, tối ưu cho công việc sáng tạo nội dung, học tập và giải trí đỉnh cao.</p><ul><li>Hỗ trợ Apple Pencil Pro và Magic Keyboard thế hệ mới.</li><li>Màn hình Liquid Retina dải màu P3 sống động.</li></ul>', 16890000.00, 1, 0, NOW(), NOW()),

-- 2. Laptop
(7, 'Laptop Dell Inspiron 15', '<p>Chiếc laptop lý tưởng cho nhân viên văn phòng và sinh viên cần sự ổn định bền bỉ suốt ngày dài.</p><ul><li><strong>CPU:</strong> Intel Core i5 thế hệ mới tốc độ xử lý nhanh nhạy.</li><li><strong>RAM:</strong> 16GB đa nhiệm mượt mà không lo giật lag.</li><li><strong>Ổ cứng:</strong> SSD 512GB PCIe NVMe khởi động máy trong vài giây.</li><li><strong>Màn hình:</strong> 15.6 inch FHD viền mỏng chống chói.</li></ul>', 15490000.00, 2, 0, NOW(), NOW()),

(8, 'MacBook Pro 14 inch M3 Pro 18GB/512GB Space Black', '<h2>1. Vẻ đẹp huyền bí từ sắc màu Space Black thế hệ mới</h2><p>MacBook Pro 14 inch M3 Pro khoác lên mình bộ cánh màu Đen Không Gian (Space Black) đầy mê hoặc. Bề mặt nhôm nguyên khối được xử lý bằng công nghệ Anode hóa đột phá, tạo lớp phủ ngăn ngừa bám dấu vân tay và mồ hôi hiệu quả hơn hẳn các thế hệ trước.</p><blockquote><p>"Chiếc máy tính xách tay chuyên nghiệp đạt độ hoàn thiện cao nhất trong phân khúc máy trạm di động hiện nay." — Ban Biên Tập Tạp chí Công nghệ</p></blockquote><h2>2. Sức mạnh vượt trội từ vi xử lý Apple M3 Pro</h2><p>Trang bị chip Apple M3 Pro với 11 nhân CPU và 14 nhân GPU được xây dựng trên tiến trình 3nm hiện đại bậc nhất thế giới. Kiến trúc GPU thế hệ mới giới thiệu tính năng <strong>Dynamic Caching</strong> (Bộ nhớ đệm động), giúp tối ưu hóa dung lượng bộ nhớ dùng chung theo thời gian thực cho từng tác vụ đồ họa.</p><ul><li><strong>Khả năng dựng video:</strong> Chỉnh sửa mượt mà đồng thời nhiều luồng video 4K và 8K ProRes trong Final Cut Pro mà quạt tản nhiệt hầu như không cần quay mạnh.</li><li><strong>Lập trình & Máy ảo:</strong> 18GB Unified Memory băng thông cao giúp chạy song song nhiều môi trường Docker container và máy ảo trơn tru.</li><li><strong>Thời lượng pin kỷ lục:</strong> Hoạt động liên tục lên đến 18 giờ phát lại video, mang lại sự tự do tuyệt đối khi làm việc lưu động ngoài trời.</li></ul><h2>3. Màn hình Liquid Retina XDR: Chuẩn mực màu sắc phòng thu</h2><p>Màn hình 14.2 inch Liquid Retina XDR với 10.000 bóng LED mini mang lại độ sáng duy trì 1000 nits cho toàn màn hình và đạt đỉnh 1600 nits khi hiển thị nội dung HDR. Độ tương phản 1.000.000:1 cùng dải màu P3 rộng cho độ trung thực sắc nét tuyệt đối phục vụ biên tập ảnh và dựng phim điện ảnh.</p><h2>4. Bảng thông số kỹ thuật chi tiết</h2><figure class="table"><table><thead><tr><th>Hạng mục</th><th>Cấu hình trang bị</th><th>Ý nghĩa thực tế</th></tr></thead><tbody><tr><td>Bộ vi xử lý (CPU/GPU)</td><td>Apple M3 Pro (11-core CPU, 14-core GPU)</td><td>Render 3D, code phần mềm và xuất phim siêu tốc</td></tr><tr><td>Bộ nhớ Unified Memory</td><td>18GB Ram hợp nhất băng thông 150GB/s</td><td>Đa nhiệm hàng chục ứng dụng nặng cùng lúc</td></tr><tr><td>Ổ cứng lưu trữ</td><td>512GB SSD NVMe tốc độ đọc ghi > 5000 MB/s</td><td>Mở dự án dung lượng lớn trong chớp mắt</td></tr><tr><td>Hệ thống âm thanh</td><td>Hệ thống 6 loa Spatial Audio với loa trầm khử lực</td><td>Âm thanh vòm phòng thu sống động như rạp hát</td></tr></tbody></table></figure><h2>5. Kết luận</h2><p>MacBook Pro 14 M3 Pro là sự đầu tư chuẩn xác và bền bỉ lâu dài cho các chuyên gia công nghệ, lập trình viên cao cấp, kiến trúc sư và nhà sáng tạo nội dung số.</p>', 48990000.00, 2, 0, NOW(), NOW()),

(9, 'Laptop ASUS ROG Zephyrus G16 OLED Gaming', '<p>Quái thú gaming ẩn mình trong bộ khung nhôm mỏng nhẹ thanh lịch chỉ dày 1.49cm.</p><ul><li>Trang bị CPU Intel Core Ultra 9 kết hợp card đồ họa RTX 4070 8GB GDDR6.</li><li>Màn hình OLED 2.5K 240Hz tốc độ phản hồi siêu nhanh 0.2ms.</li><li>Hệ thống tản nhiệt buồng hơi Tri-Fan làm mát tức thì.</li></ul>', 55990000.00, 2, 0, NOW(), NOW()),

(10, 'Laptop Dell XPS 13 Plus 9320 Core i7', '<p>Thiết kế tương lai mang tính biểu tượng với hàng phím chức năng cảm ứng điện dung và touchpad kính tàng hình liền mạch tuyệt đẹp.</p>', 37500000.00, 2, 0, NOW(), NOW()),

(11, 'Laptop Lenovo ThinkPad X1 Carbon Gen 11', '<p>Biểu tượng laptop doanh nhân chuẩn quân đội MIL-STD-810H, bàn phím gõ êm ái hàng đầu thế giới với trọng lượng siêu nhẹ 1.12kg.</p>', 39990000.00, 2, 0, NOW(), NOW()),

-- 3. Phụ kiện
(12, 'Tai nghe Bluetooth Sony WH-CH520', '<p>Thưởng thức âm nhạc trọn vẹn với thời lượng pin lên đến 50 giờ, công nghệ phục hồi âm thanh số DSEE và mic thoại rõ ràng.</p>', 1290000.00, 3, 0, NOW(), NOW()),

(13, 'Tai nghe Chống Ồn Cao Cấp Sony WH-1000XM5', '<h2>1. Định nghĩa lại chuẩn mực chống ồn thế giới</h2><p>Sony WH-1000XM5 khẳng định vị thế dẫn đầu tuyệt đối trong phân khúc tai nghe chống ồn chủ động (ANC) cao cấp nhờ hệ thống vi xử lý kép <strong>Integrated Processor V1</strong> và <strong>HD Noise Cancelling Processor QN1</strong>.</p><blockquote><p>"Hệ thống 8 micro thu âm thông minh tự động tối ưu hóa khả năng triệt tiêu tiếng ồn theo áp suất không khí và môi trường xung quanh, biến mọi khoang máy bay hay quán cà phê ồn ào thành không gian yên tĩnh tuyệt đối." — Tạp chí Âm Thanh Số</p></blockquote><h2>2. Thiết kế công thái học không áp lực Noise-Free Design</h2><p>Phần quai đeo và đệm tai được bọc chất liệu da tổng hợp mềm mại Fit Leather ôm khít vành tai một cách nhẹ nhàng. Trọng lượng siêu nhẹ chỉ 250 gram giúp người dùng có thể thưởng thức âm nhạc liên tục suốt cả ngày dài làm việc mà không hề cảm thấy đau nhức hay nặng đầu.</p><ul><li><strong>Màng loa 30mm sợi carbon:</strong> Cho âm trầm sâu lắng uy lực, dải trung ngọt ngào và dải cao tách bạch tinh khiết đạt chuẩn Hi-Res Audio Wireless.</li><li><strong>Đàm thoại đỉnh cao bằng AI:</strong> Thuật toán lọc giọng nói thông minh phân tách giọng người nói khỏi tiếng gió và tạp âm xung quanh cực kỳ trong trẻo.</li><li><strong>Thời lượng pin 30 giờ:</strong> Hỗ trợ công nghệ sạc nhanh chuẩn USB-PD – chỉ với 3 phút sạc cho ngay 3 giờ nghe nhạc liên tục.</li></ul><h2>3. Bảng thông số kỹ thuật chi tiết</h2><figure class="table"><table><thead><tr><th>Tiêu chí</th><th>Thông số kỹ thuật Sony WH-1000XM5</th><th>Đánh giá chất lượng</th></tr></thead><tbody><tr><td>Công nghệ chống ồn</td><td>2 chip QN1 + V1, 8 Micro thu âm cảm biến đa hướng</td><td>Chống ồn hiệu quả nhất hiện nay</td></tr><tr><td>Định dạng âm thanh</td><td>Hi-Res Audio, LDAC, DSEE Extreme, 360 Reality Audio</td><td>Tái tạo chi tiết âm thanh phòng thu</td></tr><tr><td>Thời lượng pin</td><td>30 giờ (bật ANC) / 40 giờ (tắt ANC)</td><td>Dùng trọn vẹn cả tuần chỉ với 1 lần sạc</td></tr><tr><td>Kết nối</td><td>Bluetooth 5.2 kết nối đa điểm đồng thời 2 thiết bị</td><td>Chuyển đổi liền mạch giữa laptop và điện thoại</td></tr></tbody></table></figure><h2>4. Đánh giá ưu điểm & Nhược điểm</h2><p><strong>Ưu điểm:</strong> Chống ồn đỉnh chóp, chất âm cân bằng ấm áp, mic đàm thoại xuất sắc, pin dùng cực trâu.</p><p><strong>Nhược điểm:</strong> Không thể gập gọn như đời XM4, hộp đựng kích thước khá to.</p>', 7990000.00, 3, 0, NOW(), NOW()),

(14, 'Chuột không dây công thái học Logitech MX Master 3S', '<p>Cảm biến quang học Darkfield 8000 DPI lướt mượt trên mọi bề mặt, nút bấm Silent Clicks giảm 90% tiếng ồn, cuộn MagSpeed siêu tốc.</p>', 2290000.00, 3, 0, NOW(), NOW()),

(15, 'Bàn phím cơ không dây Logitech MX Mechanical', '<p>Bàn phím cơ low-profile phím gõ đầm tay chuẩn xác, đèn nền thông minh tự động sáng khi bàn tay lại gần và kết nối đồng thời 3 thiết bị.</p>', 3490000.00, 3, 0, NOW(), NOW()),

(16, 'Củ sạc nhanh Anker GaNPrime 65W 3 Cổng', '<p>Công nghệ bán dẫn GaN thế hệ mới nhỏ gọn hơn 53%, công suất tối đa 65W sạc nhanh cùng lúc cho Laptop, iPhone và iPad an toàn.</p>', 890000.00, 3, 0, NOW(), NOW()),

-- 4. Thời trang Nam
(17, 'Áo polo nam thể thao Coolmate ProMax', '<p>Chất liệu vải sợi Quick-Dry thoát ẩm tối ưu, form áo Regular-fit đứng dáng tôn nét nam tính trẻ trung năng động.</p>', 239000.00, 4, 0, NOW(), NOW()),

(18, 'Quần Jean nam ống suông co giãn Levi\'s 511', '<p>Dáng Slim Fit vừa vặn hiện đại, chất vải denim pha sợi co giãn thoải mái cử động, wash màu thời thượng dễ phối đồ.</p>', 1450000.00, 4, 0, NOW(), NOW()),

(19, 'Áo sơ mi nam Oxford Routine tay dài', '<p>Vải dệt Oxford 100% cotton dày dặn đứng form, thoáng khí, giữ nếp phẳng phiu suốt cả ngày làm việc nơi công sở.</p>', 490000.00, 4, 0, NOW(), NOW()),

(20, 'Áo khoác gió nam chống nước The North Face', '<p>Vải công nghệ DryVent chống gió và chống thấm nước hoàn hảo, trọng lượng nhẹ có thể gấp gọn bỏ túi tiện lợi.</p>', 1890000.00, 4, 0, NOW(), NOW()),

-- 5. Thời trang Nữ
(21, 'Đầm hoa nhí voan tơ dáng xòe tiểu thư', '<p>Thiết kế cổ vuông khoe xương quai xanh thanh tú, chất liệu voan tơ cao cấp mềm mại rũ nhẹ nhàng theo từng bước đi.</p>', 580000.00, 5, 0, NOW(), NOW()),

(22, 'Áo sơ mi lụa tơ tằm cổ nơ quý phái', '<p>Lụa tơ tằm tự nhiên óng ả mềm mượt, chi tiết nơ cổ sang trọng tạo điểm nhấn thanh lịch cho quý cô công sở.</p>', 420000.00, 5, 0, NOW(), NOW()),

(23, 'Chân váy chữ A xếp ly phong cách Hàn Quốc', '<p>Cạp cao che khuyết điểm tôn dáng, vải tuyết mưa bền đẹp không nhăn không xù lông sau khi giặt.</p>', 320000.00, 5, 0, NOW(), NOW()),

(24, 'Túi xách nữ da thật quai chéo Crossbody', '<p>Da bò thật vân hạt bền bỉ, phụ kiện kim loại mạ vàng cao cấp, thiết kế ngăn rộng rãi tiện lợi đựng điện thoại và mỹ phẩm.</p>', 950000.00, 5, 0, NOW(), NOW()),

-- 6. Đồng hồ & Trang sức
(25, 'Đồng hồ thông minh Apple Watch Ultra 2', '<p>Khung viền titan 49mm chống va đập, màn hình sáng 3000 nits, định vị GPS kép chính xác và thời lượng pin vượt trội lên tới 72 giờ.</p>', 20490000.00, 6, 0, NOW(), NOW()),

(26, 'Đồng hồ nam dây kim loại Casio Edifice Chronograph', '<p>Thiết kế mặt đồng hồ thể thao đa kim dũng mãnh, kính sapphire chống trầy và công nghệ năng lượng ánh sáng Tough Solar.</p>', 4850000.00, 6, 0, NOW(), NOW()),

(27, 'Đồng hồ thể thao Garmin Fenix 7 Pro Sapphire Solar', '<p>Dành riêng cho vận động viên chuyên nghiệp và người đam mê thể thao ngoài trời với bản đồ địa hình màu và cảm biến nhịp tim thế hệ 5.</p>', 19490000.00, 6, 0, NOW(), NOW()),

(28, 'Dây chuyền bạc Ý đính pha lê Swarovski', '<p>Bạc cao cấp xi bạch kim sáng bóng lâu phai, viên pha lê Swarovski tinh xảo lấp lánh phản chiếu ánh sáng kiêu sa.</p>', 850000.00, 6, 0, NOW(), NOW()),

-- 7. Mỹ phẩm & Làm đẹp
(29, 'Serum phục hồi da La Roche-Posay Hyalu B5 30ml', '<p>Công thức đột phá kết hợp 2 loại Hyaluronic Acid nguyên chất, Vitamin B5 và Madecassoside tái tạo hàng rào bảo vệ da căng mịn.</p>', 895000.00, 7, 0, NOW(), NOW()),

(30, 'Kem chống nắng Anessa Perfect UV Sunscreen 60ml', '<p>Công nghệ Auto Booster tăng cường màng chắn bảo vệ khi tiếp xúc nhiệt độ, độ ẩm, mồ hôi và nước. Bảo vệ da tối ưu SPF50+ PA++++.</p>', 585000.00, 7, 0, NOW(), NOW()),

(31, 'Sữa rửa mặt Cerave Foaming Facial Cleanser 473ml', '<p>Chứa 3 Ceramides thiết yếu giúp làm sạch sâu bã nhờn mà vẫn duy trì độ ẩm tự nhiên, không gây cảm giác khô căng.</p>', 380000.00, 7, 0, NOW(), NOW()),

(32, 'Nước hoa nam Chanel Bleu de Chanel EDP 100ml', '<p>Hương thơm gỗ nồng nàn nam tính, mở đầu sảng khoái với hương cam chanh rồi lắng đọng ấm áp cùng hổ phách và tuyết tùng.</p>', 3750000.00, 7, 0, NOW(), NOW()),

-- 8. Thiết bị điện gia dụng
(33, 'Nồi chiên không dầu Philips XXL HD9650 7.3L', '<p>Công nghệ Twin TurboStar loại bỏ đến 90% dầu mỡ trong thực phẩm, công suất 2225W nướng chín đều trọn vẹn gà nguyên con.</p>', 5990000.00, 8, 0, NOW(), NOW()),

(34, 'Nồi cơm điện cao tần Toshiba 1.8L RC-18IX1PV', '<p>Gia nhiệt cảm ứng từ IH 360 độ kết hợp lòng nồi chống dính dày 3mm cho hạt cơm chín đều thơm dẻo đậm vị tự nhiên.</p>', 2490000.00, 8, 0, NOW(), NOW()),

(35, 'Máy lọc không khí Xiaomi Smart Air Purifier 4 Pro', '<p>Hệ thống màng lọc HEPA 3 trong 1 khử sạch bụi mịn PM2.5, phấn hoa, mùi ẩm mốc và lông thú cưng cho không gian sống trong lành.</p>', 4490000.00, 8, 0, NOW(), NOW()),

(36, 'Máy hút bụi cầm tay không dây Dyson V12 Detect Slim', '<p>Công nghệ tia laser phát hiện các hạt bụi siêu nhỏ vô hình, cảm biến piezo tự động điều chỉnh lực hút thông minh.</p>', 16990000.00, 8, 0, NOW(), NOW()),

-- 9. Nhà cửa & Đời sống
(37, 'Ghế công thái học Ergonomic Chair Sihoo M57', '<h2>1. Giải pháp bảo vệ cột sống thắt lưng toàn diện</h2><p>Ngồi làm việc sai tư thế trong thời gian dài là nguyên nhân hàng đầu dẫn đến các bệnh về thoái hóa cột sống, đau mỏi vai gáy và giảm sút hiệu suất làm việc. Ghế công thái học <strong>Sihoo M57</strong> được thiết kế chuẩn y khoa để nâng đỡ cơ thể toàn diện ở mọi tư thế làm việc và thư giãn.</p><blockquote><p>"Hệ thống đệm đỡ thắt lưng đa chiều tự động thích ứng với đường cong sinh lý tự nhiên của cột sống, giúp người dùng luôn duy trì tư thế ngồi thẳng khoa học mà không tốn sức." — Chuyên gia Vật lý trị liệu</p></blockquote><h2>2. Vật liệu lưới thoáng khí toàn phần cao cấp</h2><p>Toàn bộ phần đệm ngồi và tựa lưng sử dụng chất liệu lưới sợi Polyamide đan mật độ cao, có khả năng tản nhiệt và thoát hơi mồ hôi tối ưu, đem lại cảm giác ngồi mát mẻ và êm ái ngay cả trong những ngày hè oi bức.</p><ul><li><strong>Tựa tay 3D đa hướng:</strong> Điều chỉnh nâng hạ độ cao, trượt tiến lùi và xoay góc linh hoạt nâng đỡ trọn vẹn cánh tay khi gõ bàn phím.</li><li><strong>Tựa đầu điều chỉnh 2D:</strong> Ôm sát đốt sống cổ, giảm triệt để áp lực đè nặng lên vùng gáy khi tập trung cao độ.</li><li><strong>Góc ngả lưng thư giãn 126 độ:</strong> Khóa vị trí ngả lưng 3 nấc thuận tiện cho giấc ngủ trưa ngắn tái tạo năng lượng tức thì.</li><li><strong>Piston khí nén Class 3:</strong> Đạt chứng nhận an toàn quốc tế BIFMA và TUV, chịu tải trọng tĩnh lên tới 150kg.</li></ul><h2>3. Bảng thông số cấu hình ghế</h2><figure class="table"><table><thead><tr><th>Bộ phận</th><th>Chất liệu & Tính năng</th><th>Lợi ích cho sức khỏe</th></tr></thead><tbody><tr><td>Đệm ngồi & Tựa lưng</td><td>Lưới Polyamide đàn hồi cao, viền mút định hình</td><td>Không hầm bí, thông thoáng êm ái</td></tr><tr><td>Cơ chế ngả lưng</td><td>Bộ khung thép dày 3mm, ngả 106 - 126 độ</td><td>Thư giãn đốt sống thắt lưng giữa giờ</td></tr><tr><td>Chân ghế</td><td>Hợp kim nhôm đúc nguyên khối tải trọng 500kg</td><td>Vững chãi, an toàn tuyệt đối</td></tr><tr><td>Bánh xe</td><td>Bọc nhựa PU êm ái chống trầy xước sàn gỗ</td><td>Di chuyển không tiếng ồn</td></tr></tbody></table></figure><h2>4. Đánh giá chung từ người dùng</h2><p>Sihoo M57 là mẫu ghế công thái học quốc dân có tỷ lệ hiệu năng trên giá thành (P/P) tốt nhất phân khúc, là khoản đầu tư thông minh và cần thiết nhất cho bất kỳ ai làm việc văn phòng hay setup góc làm việc tại nhà.</p>', 3650000.00, 9, 0, NOW(), NOW()),

(38, 'Bộ ga gối cotton lụa Hàn Quốc 4 món', '<p>Chất liệu cotton lụa tự nhiên êm ái mát lạnh, thấm hút mồ hôi tốt mang lại giấc ngủ thư thái trọn vẹn.</p>', 780000.00, 9, 0, NOW(), NOW()),

(39, 'Bình giữ nhiệt Lock&Lock Feather Light 500ml', '<p>Thép không gỉ 304 cao cấp giữ nhiệt nóng 8 giờ và giữ lạnh 24 giờ, trọng lượng siêu nhẹ thuận tiện mang theo mọi nơi.</p>', 329000.00, 9, 0, NOW(), NOW()),

(40, 'Đèn bàn học chống cận LED Panasonic 12W', '<p>Ánh sáng êm dịu không nhấp nháy, đạt chuẩn an toàn thị lực RG0, cần đèn uốn cong linh hoạt nhiều hướng góc chiếu sáng.</p>', 650000.00, 9, 0, NOW(), NOW()),

-- 10. Bách hóa & Thực phẩm
(41, 'Cà phê hạt rang Arabica & Robusta Đắk Lắk 500g', '<p>Hạt cà phê đặc sản tuyển chọn thu hái chín 100%, rang mộc nguyên chất hương thơm đậm đà quyến rũ hậu vị ngọt sâu khó quên.</p>', 165000.00, 10, 0, NOW(), NOW()),

(42, 'Hạt dinh dưỡng Granola mật ong sấy giòn 500g', '<p>Yến mạch nguyên cám hòa quyện cùng hạnh nhân, hạt điều, óc chó sấy giòn tẩm mật ong rừng tự nhiên giàu chất xơ và năng lượng lành mạnh.</p>', 145000.00, 10, 0, NOW(), NOW()),

(43, 'Trà Oolong Lâm Đồng hộp thiếc cao cấp 200g', '<p>Búp trà non sương sớm trên cao nguyên Cầu Đất, hương hoa lan thoang thoảng, nước trà vàng óng ánh ngọt thanh dễ chịu.</p>', 220000.00, 10, 0, NOW(), NOW()),

(44, 'Bánh quy bơ truyền thống Danisa hoàng gia 908g', '<p>Hương bơ thơm ngậy giòn xốp theo công thức hoàng gia Đan Mạch danh tiếng, thiết kế hộp thiếc tinh xảo trang trọng.</p>', 245000.00, 10, 0, NOW(), NOW()),

-- 11. Thể thao & Dã ngoại
(45, 'Thảm tập Yoga TPE 2 lớp định tuyến 8mm', '<p>Vật liệu TPE thân thiện môi trường độ đàn hồi cao, đường kẻ laser định tuyến giúp chuẩn hóa tư thế asana an toàn cho khớp gối.</p>', 299000.00, 11, 0, NOW(), NOW()),

(46, 'Giày chạy bộ nam Nike Air Zoom Pegasus 40', '<p>Đế giữa bọt React êm ái kết hợp 2 túi khí Zoom Air phản hồi lực nảy tối ưu cho từng bước sải chân bền bỉ trên đường chạy.</p>', 3290000.00, 11, 0, NOW(), NOW()),

(47, 'Lều dã ngoại tự bung chống mưa 4 người Naturehike', '<p>Cơ chế khung thủy lực mở dựng lều nhanh chóng chỉ trong 3 giây, vải 210T phủ chống nước PU3000mm bảo vệ an toàn dưới mọi thời tiết.</p>', 1650000.00, 11, 0, NOW(), NOW()),

(48, 'Vợt cầu lông Yonex Nanoflare 800 Play', '<p>Khung vợt Sonic Flare gia tăng lực đẩy cầu uy lực và linh hoạt phản xạ nhanh nhẹn trong các pha cầu cận lưới.</p>', 1250000.00, 11, 0, NOW(), NOW()),

-- 12. Mẹ & Bé
(49, 'Sữa bột Meiji số 9 nội địa Nhật Bản 800g (1-3 tuổi)', '<p>Cung cấp đầy đủ hàm lượng DHA, sắt, canxi và FOS chất xơ tự nhiên hỗ trợ hệ tiêu hóa non nớt của bé hấp thu chất dinh dưỡng tốt nhất.</p>', 495000.00, 12, 0, NOW(), NOW()),

(50, 'Tã dán Bobby Lõi Nén Khí 3mm Mega Jumbo size L 68 miếng', '<p>Độ mỏng ấn tượng chỉ 3mm thoáng khí ngừa hăm tối ưu, bề mặt dạng sóng thấm hút tức thì khóa chặt chất lỏng suốt 12 giờ.</p>', 349000.00, 12, 0, NOW(), NOW()),

(51, 'Xe đẩy em bé gấp gọn hai chiều cao cấp', '<p>Khung hợp kim nhôm siêu nhẹ đảo chiều tay đẩy dễ dàng, hệ thống giảm xóc lò xo êm ái khi di chuyển qua các cung đường gồ ghề.</p>', 1850000.00, 12, 0, NOW(), NOW()),

(52, 'Bộ đồ chơi xếp hình sáng tạo LEGO Classic 900 chi tiết', '<p>Hộp gạch xây dựng đa dạng màu sắc và hình khối giúp phát triển tư duy logic và trí tưởng tượng phong phú của trẻ nhỏ.</p>', 980000.00, 12, 0, NOW(), NOW()),

-- 13. Sách & Văn phòng phẩm
(53, 'Bộ sách Tâm Lý Học Về Tiền & Tư Duy Nhanh Chậm', '<p>Bộ đôi tác phẩm gối đầu giường về quản trị tài chính cá nhân và hiểu rõ quy luật ra quyết định trong đời sống hiện đại.</p>', 320000.00, 13, 0, NOW(), NOW()),

(54, 'Máy đọc sách Kindle Paperwhite Gen 11 16GB', '<p>Màn hình E-ink 6.8 inch 300 ppi đọc rõ nét như sách in thật, ánh sáng vàng ấm bảo vệ mắt khi đọc đêm, pin dùng nhiều tuần.</p>', 3850000.00, 13, 0, NOW(), NOW()),

(55, 'Bút ký kim loại cao cấp Parker Sonnet mực gel', '<p>Thân bút phủ sơn mài đen bóng viền mạ vàng 23K sang trọng, ngòi bi mực gel êm ái dứt khoát tôn vinh phong thái doanh nhân.</p>', 1250000.00, 13, 0, NOW(), NOW()),

(56, 'Balo học sinh sinh viên chống gù chống nước chống trộm', '<p>Chất liệu vải Oxford chống thấm nước, quai đeo đệm thoáng khí tổ ong trợ lực cột sống, tích hợp cổng sạc USB bên hông thuận tiện.</p>', 450000.00, 13, 0, NOW(), NOW()),

-- 14. Màn hình & PC Máy tính (Danh mục mới)
(57, 'Màn hình Dell UltraSharp U2724D 27 inch 2K IPS 120Hz', '<h2>1. Chuẩn mực màn hình đồ họa chuyên nghiệp với tấm nền IPS Black</h2><p>Dell UltraSharp U2724D là chiếc màn hình máy tính văn phòng và đồ họa đầu tiên sở hữu tấm nền <strong>IPS Black</strong> đột phá kết hợp cùng tần số quét 120Hz mượt mà. Công nghệ IPS Black mang lại tỷ lệ tương phản tĩnh lên tới 2000:1 (gấp đôi so với màn hình IPS truyền thống), giúp màu đen sâu thẳm hơn và hạn chế triệt để hiện tượng hở sáng.</p><blockquote><p>"Sự bổ sung tần số quét 120Hz trên dòng màn hình văn phòng cao cấp UltraSharp là một bước tiến vượt bậc, đem lại trải nghiệm cuộn trang, di chuột và dựng hình đồ họa êm dịu cho mắt chưa từng thấy." — TechRadar Pro</p></blockquote><h2>2. Độ chuẩn màu hoàn hảo cho Designer và Video Editor</h2><p>Màn hình được cân chỉnh màu sắc trực tiếp tại nhà máy với chứng chỉ Delta E &lt; 2, đạt 100% sRGB, 100% BT.709 và 98% chuẩn điện ảnh DCI-P3 / Display P3. Cảm biến ánh sáng môi trường tích hợp tự động điều chỉnh độ sáng và nhiệt độ màu theo ánh sáng phòng, giúp bảo vệ thị lực khi làm việc liên tục thâu đêm.</p><ul><li><strong>Độ phân giải:</strong> 27 inch QHD (2560 x 1440 pixel) sắc nét, mật độ điểm ảnh 109 PPI lý tưởng cho tỷ lệ hiển thị Windows và macOS.</li><li><strong>Công nghệ ComfortView Plus:</strong> Giảm phát xạ ánh sáng xanh có hại xuống dưới 35% mà hoàn toàn không làm sai lệch màu sắc hiển thị.</li><li><strong>Chân đế công thái học:</strong> Cho phép nâng hạ 150mm, xoay dọc 90 độ hai chiều, xoay ngang và nghiêng góc linh hoạt.</li></ul><h2>3. Bảng thông số kỹ thuật chi tiết</h2><figure class="table"><table><thead><tr><th>Thông số</th><th>Màn hình Dell UltraSharp U2724D</th><th>Đánh giá ứng dụng</th></tr></thead><tbody><tr><td>Kích thước & Tấm nền</td><td>27 inch IPS Black chống chói 2.5D</td><td>Góc nhìn rộng 178 độ, màu sắc đồng nhất</td></tr><tr><td>Tần số quét & Thời gian phản hồi</td><td>120Hz / 5ms (Fast mode)</td><td>Cuộn trang mượt, chống mỏi mắt</td></tr><tr><td>Độ tương phản & Độ sáng</td><td>2000:1 / 350 nits (cd/m2)</td><td>Màu đen sâu, chi tiết vùng tối rõ nét</td></tr><tr><td>Cổng kết nối</td><td>DisplayPort 1.4, HDMI 2.1, USB-C 15W, USB-A Hub</td><td>Kết nối cùng lúc 2 PC qua Auto-KVM</td></tr></tbody></table></figure><h2>4. Tổng kết</h2><p>Dell UltraSharp U2724D là chiếc màn hình 27 inch hoàn hảo nhất cho công việc sáng tạo, thiết kế đồ họa, lập trình và văn phòng cao cấp hiện nay.</p>', 10890000.00, 14, 0, NOW(), NOW()),

(58, 'Màn hình Gaming LG UltraGear 27GR95QE OLED 240Hz', '<p>Màn hình chơi game OLED đỉnh chóp đưa bạn đắm chìm vào thế giới game với tốc độ phản hồi chớp nhoáng <strong>0.03ms (GtG)</strong>.</p><ul><li>Tần số quét 240Hz tương thích NVIDIA G-Sync và AMD FreeSync Premium.</li><li>Màu đen tuyệt đối OLED với tỷ lệ tương phản 1.500.000:1.</li><li>Thiết kế công thái học xoay nâng hạ linh hoạt và đèn viền Hexagon Lighting.</li></ul>', 18900000.00, 14, 0, NOW(), NOW()),

(59, 'Dàn PC Gaming Nova RTX 4070 Ti Super Core i7 14700K', '<p>Bộ máy tính chiến game và đồ họa 3D hạng nặng được lắp ráp đồng bộ linh kiện cao cấp được tối ưu nhiệt độ và xung nhịp.</p><ul><li><strong>CPU:</strong> Intel Core i7 14700K 20 nhân 28 luồng xung nhịp đến 5.6GHz.</li><li><strong>VGA:</strong> Gigabyte GeForce RTX 4070 Ti Super 16GB GDDR6X.</li><li><strong>RAM:</strong> Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz.</li><li><strong>Tản nhiệt:</strong> Tản nhiệt nước AIO 360mm ARGB làm mát êm ái.</li></ul>', 45900000.00, 14, 0, NOW(), NOW()),

-- 15. Máy ảnh & Quay phim (Danh mục mới)
(60, 'Máy ảnh Mirrorless Sony Alpha A7 Mark IV Body', '<p>Chiếc máy ảnh hybrid toàn năng dẫn đầu thị trường dành cho cả nhiếp ảnh gia và nhà sáng tạo nội dung video chuyên nghiệp.</p><h3>Công nghệ đột phá:</h3><ul><li>Cảm biến Full-frame Exmor R 33MP chiếu sáng sau sắc nét.</li><li>Bộ xử lý hình ảnh BIONZ XR tốc độ cao cùng lấy nét Real-time Eye AF bằng AI.</li><li>Quay video 4K 60p 10-bit 4:2:2 chuẩn màu S-Cinetone rực rỡ.</li></ul>', 49990000.00, 15, 0, NOW(), NOW()),

(61, 'Flycam DJI Mini 4 Pro Fly More Combo Plus', '<p>Flycam siêu nhẹ dưới 249g được trang bị cảm biến va chạm đa hướng và camera xoay dọc vật lý quay phim TikTok/Reels độ phân giải 4K 60fps HDR sắc nét.</p><ul><li>Thời lượng bay lên đến 45 phút với pin Plus dung lượng cao.</li><li>Truyền sóng video DJI O4 khoảng cách xa lên đến 20km.</li><li>Chế độ ActiveTrack 360 độ bám sát chủ thể mượt mà tự động.</li></ul>', 24500000.00, 15, 0, NOW(), NOW()),

(62, 'Gimbal chống rung điện thoại DJI Osmo Mobile 6', '<p>Gimbal gập gọn tiện dụng tích hợp gậy kéo dài 215mm, thuật toán chống rung 3 trục ActiveTrack 6.0 theo dõi khuôn mặt chuẩn xác tuyệt đối.</p>', 3490000.00, 15, 0, NOW(), NOW()),

-- 16. Thiết bị thông minh SmartHome (Danh mục mới)
(63, 'Robot hút bụi lau nhà Dreame L20 Ultra', '<p>Trải nghiệm lau dọn hoàn toàn tự động với công nghệ vươn giẻ lau sát góc tường MopExtend độc quyền và trạm sạc đa năng tự giặt sấy giẻ bằng khí nóng.</p><ul><li>Lực hút siêu khủng 7000Pa hút sạch mọi mảnh vụn trên sàn và thảm.</li><li>Tránh chướng ngại vật bằng camera AI 3D nhận diện hơn 55 vật thể.</li><li>Tự động bơm nước sạch và hút nước bẩn tiện lợi tối đa.</li></ul>', 19990000.00, 16, 0, NOW(), NOW()),

(64, 'Khóa cửa thông minh Aqara Smart Lock A100 Zigbee', '<p>Khóa cửa cao cấp hỗ trợ Apple Home Key mở khóa một chạm bằng iPhone/Apple Watch, cảm biến vân tay bán dẫn siêu nhạy và mã số bảo mật chống nhìn trộm.</p>', 4890000.00, 16, 0, NOW(), NOW()),

(65, 'Camera an ninh ngoài trời Imou Cruiser 2 3K 5MP xoay 360', '<p>Độ phân giải 3K 5MP siêu nét, quay quét 360 độ không góc chết, ghi hình có màu ban đêm thông minh và tích hợp còi hú báo động răn đe kẻ gian.</p>', 1150000.00, 16, 0, NOW(), NOW()),

-- 17. Âm thanh & Loa đỉnh cao (Danh mục mới)
(66, 'Loa Bluetooth Marshall Acton III phong cách cổ điển', '<p>Âm vang sống động tràn ngập không gian phòng cùng thiết kế mang đậm tính biểu tượng vintage nước Anh.</p><ul><li>Trường âm thanh rộng mở hơn thế hệ trước với các loa tweeter hướng ra ngoài.</li><li>Kết nối Bluetooth 5.2 thế hệ mới sẵn sàng cho công nghệ Bluetooth LE Audio.</li><li>Nút xoay chỉnh bass, treble vật lý mạ vàng cổ điển tinh tế.</li></ul>', 6890000.00, 17, 0, NOW(), NOW()),

(67, 'Loa di động JBL Charge 5 chống nước IP67 pin 20h', '<p>Âm thanh JBL Original Pro Sound uy lực với củ loa trầm độc lập, thiết kế chống nước chống bụi chuẩn IP67 và tích hợp sạc dự phòng cho điện thoại.</p>', 3290000.00, 17, 0, NOW(), NOW()),

(68, 'Loa Soundbar Samsung HW-Q990C 11.1.4 kênh Dolby Atmos', '<p>Rạp chiếu phim thực thụ trong phòng khách của bạn với hệ thống 11 kênh loa vòm, 1 kênh loa trầm siêu trầm và 4 kênh loa đánh trần Dolby Atmos không dây.</p>', 18990000.00, 17, 0, NOW(), NOW()),

-- 18. Nội thất & Bàn ghế công thái học (Danh mục mới)
(69, 'Bàn nâng hạ độ cao thông minh Epione SmartDesk Pro 2.0', '<p>Bàn làm việc thông minh 2 động cơ Dual Motor êm ái nâng tải 160kg, ghi nhớ 4 vị trí độ cao và cảm biến chống va chạm thông minh bảo vệ an toàn cho cả gia đình.</p>', 7990000.00, 18, 0, NOW(), NOW()),

(70, 'Ghế công thái học Herman Miller Aeron Remastered', '<p>Chiếc ghế công thái học kinh điển thế giới với lưới Pellicle 8Z thông thoáng điều áp đa vùng, cơ chế ngả lưng Harmonic 2 Tilt tự nhiên nâng niu cột sống tối đa.</p>', 34900000.00, 18, 0, NOW(), NOW()),

(71, 'Kệ đỡ màn hình máy tính gỗ sồi tự nhiên kèm khay kéo', '<p>Chất liệu gỗ sồi tự nhiên nguyên khối được gia công tỉ mỉ chống cong vênh, tạo không gian gọn gàng nâng màn hình ngang tầm mắt hạn chế mỏi cổ.</p>', 650000.00, 18, 0, NOW(), NOW()),

-- 19. Thời trang Thể thao & Sneaker (Danh mục mới)
(72, 'Giày chạy bộ Adidas Ultraboost Light 23', '<p>Đế giữa Light BOOST nhẹ hơn 30% so với thế hệ trước đem lại độ phản hồi lực và bước chạy êm ái bồng bềnh suốt chặng đường dài.</p>', 3490000.00, 19, 0, NOW(), NOW()),

(73, 'Giày thể thao New Balance 550 White Green cổ điển', '<p>Thiết kế bóng rổ retro thập niên 80 trường tồn theo thời gian, chất liệu da cao cấp phối sắc trắng xanh lục cổ điển dễ dàng phối mọi trang phục streetwear.</p>', 2850000.00, 19, 0, NOW(), NOW()),

(74, 'Bộ quần áo tập gym nam thoáng khí Under Armour HeatGear', '<p>Chất vải nén HeatGear độc quyền siêu nhẹ co giãn 4 chiều, hỗ trợ cơ bắp hoạt động hiệu quả và kiểm soát mồ hôi khô thoáng suốt buổi tập.</p>', 890000.00, 19, 0, NOW(), NOW()),

-- 20. Phụ kiện Ô tô & Xe máy (Danh mục mới)
(75, 'Camera hành trình 70mai Omni X200 xoay 360 độ 60fps', '<p>Camera hành trình xoay 360 độ đầu tiên trên thế giới trang bị công nghệ phát hiện chuyển động AI, ghi hình ban đêm cảm biến PureCel Plus-S HDR vượt trội.</p>', 2990000.00, 20, 0, NOW(), NOW()),

(76, 'Bơm lốp ô tô điện tử tự ngắt Xiaomi 70mai Air Compressor', '<p>Lực bơm nhanh đầy lốp chỉ trong vài phút, màn hình hiển thị áp suất lốp điện tử chuẩn xác và tính năng tự động ngắt khi đạt đủ áp suất cài đặt sẵn.</p>', 750000.00, 20, 0, NOW(), NOW()),

(77, 'Tẩu sạc nhanh xe hơi Baseus 65W GaN 2 cổng Type-C + USB', '<p>Công suất 65W mạnh mẽ đủ sạc cho cả laptop và điện thoại trên ô tô, mạch quản lý điện thông minh chống đoản mạch quá dòng an toàn.</p>', 350000.00, 20, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), price = VALUES(price);

-- 3. HÌNH ẢNH SẢN PHẨM (PRODUCT_IMAGES)
INSERT INTO product_images (product_id, url, is_deleted) VALUES
(1, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80', 0),
(2, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80', 0),
(3, 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80', 0),
(4, 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&auto=format&fit=crop&q=80', 0),
(5, 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80', 0),
(6, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80', 0),
(7, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80', 0),
(8, 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80', 0),
(9, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80', 0),
(10, 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80', 0),
(11, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80', 0),
(12, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 0),
(13, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80', 0),
(14, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80', 0),
(15, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80', 0),
(16, 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80', 0),
(17, 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80', 0),
(18, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80', 0),
(19, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80', 0),
(20, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80', 0),
(21, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80', 0),
(22, 'https://images.unsplash.com/photo-1589810635657-232948472d98?w=800&auto=format&fit=crop&q=80', 0),
(23, 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&auto=format&fit=crop&q=80', 0),
(24, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80', 0),
(25, 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80', 0),
(26, 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80', 0),
(27, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80', 0),
(28, 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80', 0),
(29, 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80', 0),
(30, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80', 0),
(31, 'https://images.unsplash.com/photo-1556228722-d0b7194f1011?w=800&auto=format&fit=crop&q=80', 0),
(32, 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&auto=format&fit=crop&q=80', 0),
(33, 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80', 0),
(34, 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=800&auto=format&fit=crop&q=80', 0),
(35, 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&auto=format&fit=crop&q=80', 0),
(36, 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80', 0),
(37, 'https://images.unsplash.com/photo-1580481077195-c22ae2b30928?w=800&auto=format&fit=crop&q=80', 0),
(38, 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=800&auto=format&fit=crop&q=80', 0),
(39, 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80', 0),
(40, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80', 0),
(41, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80', 0),
(42, 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=800&auto=format&fit=crop&q=80', 0),
(43, 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80', 0),
(44, 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80', 0),
(45, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80', 0),
(46, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80', 0),
(47, 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&auto=format&fit=crop&q=80', 0),
(48, 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=80', 0),
(49, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80', 0),
(50, 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800&auto=format&fit=crop&q=80', 0),
(51, 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&auto=format&fit=crop&q=80', 0),
(52, 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&auto=format&fit=crop&q=80', 0),
(53, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80', 0),
(54, 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?w=800&auto=format&fit=crop&q=80', 0),
(55, 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80', 0),
(56, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80', 0),
-- Hình ảnh sản phẩm mới (57 đến 77)
(57, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80', 0),
(58, 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=80', 0),
(59, 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80', 0),
(60, 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80', 0),
(61, 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=800&auto=format&fit=crop&q=80', 0),
(62, 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80', 0),
(63, 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80', 0),
(64, 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80', 0),
(65, 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&auto=format&fit=crop&q=80', 0),
(66, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80', 0),
(67, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=80', 0),
(68, 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80', 0),
(69, 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&auto=format&fit=crop&q=80', 0),
(70, 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80', 0),
(71, 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&auto=format&fit=crop&q=80', 0),
(72, 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80', 0),
(73, 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80', 0),
(74, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80', 0),
(75, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80', 0),
(76, 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=800&auto=format&fit=crop&q=80', 0),
(77, 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80', 0);

-- 4. TỒN KHO SẢN PHẨM (INVENTORIES)
INSERT INTO inventories (product_id, quantity, reserved_quantity, version, created_at, updated_at) VALUES
(1, 25, 0, 0, NOW(), NOW()),
(2, 15, 0, 0, NOW(), NOW()),
(3, 18, 0, 0, NOW(), NOW()),
(4, 12, 0, 0, NOW(), NOW()),
(5, 8, 0, 0, NOW(), NOW()),
(6, 20, 0, 0, NOW(), NOW()),
(7, 14, 0, 0, NOW(), NOW()),
(8, 10, 0, 0, NOW(), NOW()),
(9, 6, 0, 0, NOW(), NOW()),
(10, 9, 0, 0, NOW(), NOW()),
(11, 12, 0, 0, NOW(), NOW()),
(12, 30, 0, 0, NOW(), NOW()),
(13, 22, 0, 0, NOW(), NOW()),
(14, 35, 0, 0, NOW(), NOW()),
(15, 16, 0, 0, NOW(), NOW()),
(16, 50, 0, 0, NOW(), NOW()),
(17, 80, 0, 0, NOW(), NOW()),
(18, 40, 0, 0, NOW(), NOW()),
(19, 45, 0, 0, NOW(), NOW()),
(20, 25, 0, 0, NOW(), NOW()),
(21, 30, 0, 0, NOW(), NOW()),
(22, 38, 0, 0, NOW(), NOW()),
(23, 55, 0, 0, NOW(), NOW()),
(24, 18, 0, 0, NOW(), NOW()),
(25, 14, 0, 0, NOW(), NOW()),
(26, 22, 0, 0, NOW(), NOW()),
(27, 8, 0, 0, NOW(), NOW()),
(28, 40, 0, 0, NOW(), NOW()),
(29, 65, 0, 0, NOW(), NOW()),
(30, 90, 0, 0, NOW(), NOW()),
(31, 70, 0, 0, NOW(), NOW()),
(32, 15, 0, 0, NOW(), NOW()),
(33, 18, 0, 0, NOW(), NOW()),
(34, 24, 0, 0, NOW(), NOW()),
(35, 15, 0, 0, NOW(), NOW()),
(36, 7, 0, 0, NOW(), NOW()),
(37, 22, 0, 0, NOW(), NOW()),
(38, 35, 0, 0, NOW(), NOW()),
(39, 60, 0, 0, NOW(), NOW()),
(40, 40, 0, 0, NOW(), NOW()),
(41, 100, 0, 0, NOW(), NOW()),
(42, 85, 0, 0, NOW(), NOW()),
(43, 45, 0, 0, NOW(), NOW()),
(44, 60, 0, 0, NOW(), NOW()),
(45, 50, 0, 0, NOW(), NOW()),
(46, 26, 0, 0, NOW(), NOW()),
(47, 15, 0, 0, NOW(), NOW()),
(48, 20, 0, 0, NOW(), NOW()),
(49, 55, 0, 0, NOW(), NOW()),
(50, 70, 0, 0, NOW(), NOW()),
(51, 12, 0, 0, NOW(), NOW()),
(52, 30, 0, 0, NOW(), NOW()),
(53, 60, 0, 0, NOW(), NOW()),
(54, 18, 0, 0, NOW(), NOW()),
(55, 25, 0, 0, NOW(), NOW()),
(56, 45, 0, 0, NOW(), NOW()),
-- Tồn kho cho sản phẩm mới 57 đến 77
(57, 20, 0, 0, NOW(), NOW()),
(58, 15, 0, 0, NOW(), NOW()),
(59, 8, 0, 0, NOW(), NOW()),
(60, 10, 0, 0, NOW(), NOW()),
(61, 14, 0, 0, NOW(), NOW()),
(62, 30, 0, 0, NOW(), NOW()),
(63, 12, 0, 0, NOW(), NOW()),
(64, 25, 0, 0, NOW(), NOW()),
(65, 40, 0, 0, NOW(), NOW()),
(66, 18, 0, 0, NOW(), NOW()),
(67, 35, 0, 0, NOW(), NOW()),
(68, 9, 0, 0, NOW(), NOW()),
(69, 16, 0, 0, NOW(), NOW()),
(70, 5, 0, 0, NOW(), NOW()),
(71, 50, 0, 0, NOW(), NOW()),
(72, 28, 0, 0, NOW(), NOW()),
(73, 32, 0, 0, NOW(), NOW()),
(74, 45, 0, 0, NOW(), NOW()),
(75, 22, 0, 0, NOW(), NOW()),
(76, 50, 0, 0, NOW(), NOW()),
(77, 65, 0, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), reserved_quantity = 0;

-- Bù tồn kho cho mọi sản phẩm có trong bảng products nhưng chưa có dòng tương ứng trong inventories:
INSERT INTO inventories (product_id, quantity, reserved_quantity, version, created_at, updated_at)
SELECT p.id, 30, 0, 0, NOW(), NOW()
FROM products p
WHERE p.id NOT IN (SELECT product_id FROM inventories)
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

-- Đảm bảo mọi dòng tồn kho có số lượng khả dụng > 0:
UPDATE inventories SET quantity = 30, reserved_quantity = 0 WHERE quantity <= 0;

-- 5. CHƯƠNG TRÌNH KHUYẾN MÃI FLASH SALE (FLASH_SALES)
INSERT INTO flash_sales (name, description, scope, discount_type, discount_value, start_at, end_at, is_active, is_deleted, created_at, updated_at) VALUES
('Đại Tiệc Mua Sắm Toàn Sàn 2026', 'Ưu đãi giảm giá 15% cho toàn bộ sản phẩm trên sàn nhân dịp khai trương mùa lễ hội', 'ALL', 'PERCENTAGE', 15.00, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 1, 0, NOW(), NOW());
