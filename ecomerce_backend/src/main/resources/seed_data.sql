-- ==============================================================
-- DỮ LIỆU MẪU ĐA NGÀNH HÀNG CHO DỰ ÁN SHOPNOVA E-COMMERCE
-- Hệ thống bao gồm 13 danh mục chính và hơn 50 sản phẩm phổ biến
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
(13, 'Sách & Văn phòng phẩm', 'Sách bán chạy, máy đọc sách điện tử, bút ký và văn phòng phẩm cao cấp', 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- 2. SẢN PHẨM (PRODUCTS)
INSERT INTO products (id, name, description, price, category_id, is_deleted, created_at, updated_at) VALUES
-- Điện thoại
(1, 'Điện thoại Galaxy A55', 'Màn hình 6.6 inch Super AMOLED 120Hz, RAM 8GB, bộ nhớ 128GB, camera 50MP chống rung OIS sắc nét, chuẩn kháng nước IP67.', 9990000.00, 1, 0, NOW(), NOW()),
(2, 'iPhone 15 128GB', 'Màn hình Super Retina XDR với Dynamic Island thông minh, chip A16 Bionic mạnh mẽ, camera chính 48MP bắt trọn chi tiết, cổng kết nối Type-C tiện lợi.', 19990000.00, 1, 0, NOW(), NOW()),
(3, 'iPhone 15 Pro Max 256GB Titan Tự Nhiên', 'Thiết kế khung viền Titan chuẩn hàng không vũ trụ siêu bền nhẹ, nút tác vụ Action Button linh hoạt, vi xử lý Apple A17 Pro cực đỉnh, zoom quang học 5x.', 29490000.00, 1, 0, NOW(), NOW()),
(4, 'Samsung Galaxy S24 Ultra 512GB AI Phone', 'Quyền năng Galaxy AI tiên phong, khung viền Titanium sang trọng, màn hình phẳng 6.8 inch Dynamic AMOLED 2X sáng rực rỡ, tích hợp bút S-Pen, camera 200MP.', 31990000.00, 1, 0, NOW(), NOW()),
(5, 'Xiaomi 14 Ultra 5G Leica Camera', 'Tuyệt tác nhiếp ảnh với cụm 4 camera Leica Summilux cảm biến 1 inch, chip Snapdragon 8 Gen 3 siêu tốc độ, màn hình Liquid Display 2K 120Hz mượt mà.', 26490000.00, 1, 0, NOW(), NOW()),
(6, 'iPad Air 11 inch M2 Wi-Fi 128GB', 'Sức mạnh vô song từ chip Apple M2 với Neural Engine tiên tiến, màn hình Liquid Retina chống lóa, tương thích Apple Pencil Pro thế hệ mới nhất.', 16890000.00, 1, 0, NOW(), NOW()),

-- Laptop
(7, 'Laptop Dell Inspiron 15', 'Core i5 thế hệ mới, RAM 16GB, SSD 512GB PCIe NVMe tốc độ cao, màn hình 15.6 inch FHD chống lóa, hoàn hảo cho công việc văn phòng và học tập.', 15490000.00, 2, 0, NOW(), NOW()),
(8, 'MacBook Pro 14 inch M3 Pro 18GB/512GB Space Black', 'Chip Apple M3 Pro siêu khủng xử lý render 3D và dựng phim 8K mượt mà, màn hình Liquid Retina XDR 120Hz chuẩn rạp chiếu phim, thời lượng pin đến 18 giờ.', 48990000.00, 2, 0, NOW(), NOW()),
(9, 'Laptop ASUS ROG Zephyrus G16 OLED Gaming', 'Cỗ máy gaming đỉnh cao siêu mỏng nhẹ, CPU Intel Core Ultra 9 185H, GPU NVIDIA RTX 4070 8GB GDDR6, màn hình OLED ROG Nebula 2.5K 240Hz 0.2ms.', 55990000.00, 2, 0, NOW(), NOW()),
(10, 'Laptop Dell XPS 13 Plus 9320 Core i7', 'Tuyệt tác thiết kế tương lai với hàng phím chức năng cảm ứng điện dung, touchpad kính tàng hình, màn hình cảm ứng 3.5K OLED rực rỡ, RAM 16GB, SSD 512GB.', 37500000.00, 2, 0, NOW(), NOW()),
(11, 'Laptop Lenovo ThinkPad X1 Carbon Gen 11', 'Biểu tượng laptop doanh nhân bền bỉ với khung sợi carbon chuẩn quân đội MIL-STD-810H, trọng lượng chỉ 1.12kg, bàn phím gõ êm ái số 1 thế giới.', 39990000.00, 2, 0, NOW(), NOW()),

-- Phụ kiện
(12, 'Tai nghe Bluetooth Sony WH-CH520', 'Thời lượng pin lên đến 50 giờ bền bỉ, công nghệ nâng cấp âm thanh DSEE, kết nối Bluetooth đa điểm tiện lợi chuyển đổi giữa điện thoại và máy tính.', 1290000.00, 3, 0, NOW(), NOW()),
(13, 'Tai nghe Chống Ồn Cao Cấp Sony WH-1000XM5', 'Chống ồn chủ động đỉnh cao với 2 chip xử lý V1 và QN1, màng loa 30mm mạ carbon cho âm thanh Hi-Res Audio tinh khiết, cuộc gọi trong trẻo với 8 micro AI.', 7990000.00, 3, 0, NOW(), NOW()),
(14, 'Chuột không dây công thái học Logitech MX Master 3S', 'Cảm biến Darkfield 8000 DPI lướt mượt trên mọi bề mặt kể cả kính, nút bấm Silent Clicks êm ái giảm 90% tiếng ồn, cuộn siêu tốc MagSpeed 1000 dòng/giây.', 2290000.00, 3, 0, NOW(), NOW()),
(15, 'Bàn phím cơ không dây Logitech MX Mechanical', 'Switches cơ học Low-Profile Tactile Quiet phản hồi chuẩn xác êm nhẹ, đèn nền thông minh tự sáng khi bàn tay lại gần, kết nối Bluetooth & Logi Bolt 3 thiết bị.', 3490000.00, 3, 0, NOW(), NOW()),
(16, 'Củ sạc nhanh Anker GaNPrime 65W 3 Cổng', 'Công nghệ sạc Gallium Nitride thế hệ mới nhỏ gọn hơn 53%, công suất tối đa 65W sạc nhanh cùng lúc cho Laptop, iPad và iPhone, kiểm soát nhiệt độ ActiveShield 2.0.', 890000.00, 3, 0, NOW(), NOW()),

-- Thời trang Nam
(17, 'Áo polo nam thể thao Coolmate ProMax', 'Chất liệu sợi Quick-Dry thoát ẩm vượt trội, công nghệ dệt tổ ong thoáng mát, cổ áo định hình không bai dão sau nhiều lần giặt, chuẩn form tôn dáng nam tính.', 239000.00, 4, 0, NOW(), NOW()),
(18, 'Quần Jean nam ống suông co giãn Levi\'s 511', 'Dáng slim fit trẻ trung vừa vặn, chất liệu denim pha sợi elastane co giãn thoải mái cử động cả ngày, wash màu thời thượng dễ phối đồ.', 1450000.00, 4, 0, NOW(), NOW()),
(19, 'Áo sơ mi nam Oxford Routine tay dài', 'Vải dệt Oxford 100% cotton dày dặn đứng form, giữ nếp phẳng phiu suốt ngày làm việc, phù hợp đi làm công sở lẫn dạo phố cuối tuần.', 490000.00, 4, 0, NOW(), NOW()),
(20, 'Áo khoác gió nam chống nước The North Face', 'Công nghệ vải DryVent chống gió chống thấm nước tuyệt đối, lớp lót lưới thoáng khí không bí bách, mũ trùm đầu gập gọn tiện lợi, trọng lượng siêu nhẹ.', 1890000.00, 4, 0, NOW(), NOW()),

-- Thời trang Nữ
(21, 'Đầm hoa nhí voan tơ dáng xòe tiểu thư', 'Thiết kế cổ vuông tôn xương quai xanh quyến rũ, tay phồng bồng bềnh, chất liệu voan tơ cao cấp lót lụa mềm mại thoáng mát, tôn dáng nữ tính nhẹ nhàng.', 580000.00, 5, 0, NOW(), NOW()),
(22, 'Áo sơ mi lụa tơ tằm cổ nơ quý phái', 'Chất lụa tơ tằm mềm mịn rũ tự nhiên, ánh satin sang trọng, chi tiết nơ cổ thanh lịch tạo điểm nhấn duyên dáng cho quý cô công sở hiện đại.', 420000.00, 5, 0, NOW(), NOW()),
(23, 'Chân váy chữ A xếp ly phong cách Hàn Quốc', 'Chân váy cạp cao hack dáng che khuyết điểm, vải tuyết mưa cao cấp không nhăn xù, khóa kéo giọt nước tinh tế phía sau, dễ phối cùng áo sơ mi hay áo thun.', 320000.00, 5, 0, NOW(), NOW()),
(24, 'Túi xách nữ da thật quai chéo Crossbody', 'Da bò vân hạt cao cấp chống trầy xước, khóa kim loại mạ vàng sang trọng, các ngăn chứa tiện lợi vừa điện thoại, ví tiền và mỹ phẩm.', 950000.00, 5, 0, NOW(), NOW()),

-- Đồng hồ & Trang sức
(25, 'Đồng hồ thông minh Apple Watch Ultra 2', 'Khung viền titan 49mm chuẩn hàng không vũ trụ, màn hình sáng nhất 3000 nits, định vị GPS kép chuẩn xác cao, thời lượng pin đến 72 giờ ở chế độ tiết kiệm.', 20490000.00, 6, 0, NOW(), NOW()),
(26, 'Đồng hồ nam dây kim loại Casio Edifice Chronograph', 'Mặt số đa tầng thể thao cá tính, kính sapphire chống phản quang chống trầy, khả năng chịu nước 100m, nạp pin bằng năng lượng ánh sáng Tough Solar.', 4850000.00, 6, 0, NOW(), NOW()),
(27, 'Đồng hồ thể thao Garmin Fenix 7 Pro Sapphire Solar', 'Thấu kính sạc năng lượng mặt trời Power Sapphire, tích hợp đèn pin LED siêu sáng, bản đồ địa hình đa lục địa và tính năng theo dõi sức khỏe chuyên sâu.', 19490000.00, 6, 0, NOW(), NOW()),
(28, 'Dây chuyền bạc Ý đính pha lê Swarovski', 'Bạc Ý 925 xi mạ bạch kim sáng bóng không xỉn màu, mặt dây nạm pha lê Swarovski lấp lánh phản chiếu ánh sáng sắc sảo, hộp quà tặng cao cấp sang trọng.', 850000.00, 6, 0, NOW(), NOW()),

-- Mỹ phẩm & Làm đẹp
(29, 'Serum phục hồi da La Roche-Posay Hyalu B5 30ml', 'Phức hợp 2 loại Axit Hyaluronic nguyên chất kết hợp Vitamin B5 và Madecassoside giúp tái tạo phục hồi hàng rào bảo vệ da, cấp ẩm căng bóng tức thì.', 895000.00, 7, 0, NOW(), NOW()),
(30, 'Kem chống nắng Anessa Perfect UV Sunscreen 60ml', 'Công nghệ Auto Booster chống nước, mồ hôi và độ ẩm vượt trội, chỉ số SPF50+ PA++++ bảo vệ da toàn diện, kết cấu sữa mỏng nhẹ kiềm dầu cả ngày.', 585000.00, 7, 0, NOW(), NOW()),
(31, 'Sữa rửa mặt Cerave Foaming Facial Cleanser 473ml', 'Công thức chứa 3 Ceramides thiết yếu, Niacinamide và Hyaluronic Acid giúp làm sạch sâu bã nhờn mà không làm tổn hại màng ẩm tự nhiên của da.', 380000.00, 7, 0, NOW(), NOW()),
(32, 'Nước hoa nam Chanel Bleu de Chanel EDP 100ml', 'Hương thơm gỗ thơm nồng nàn quyến rũ, mở đầu tươi mát với cam bergamot và bưởi, hòa quyện tuyết tùng và hương trầm nam tính lịch lãm cuốn hút.', 3750000.00, 7, 0, NOW(), NOW()),

-- Thiết bị điện gia dụng
(33, 'Nồi chiên không dầu Philips XXL HD9650 7.3L', 'Công nghệ Twin TurboStar loại bỏ đến 90% dầu mỡ trong thực phẩm, công suất mạnh mẽ 2225W, dung tích khổng lồ chiên trọn con gà nguyên con dễ dàng.', 5990000.00, 8, 0, NOW(), NOW()),
(34, 'Nồi cơm điện cao tần Toshiba 1.8L RC-18IX1PV', 'Công nghệ nhiệt cảm ứng từ IH gia nhiệt tuần hoàn 360 độ, lòng nồi hợp kim nhôm tráng men chống dính dày 3mm, hạt cơm chín đều dẻo thơm ngọt ngào.', 2490000.00, 8, 0, NOW(), NOW()),
(35, 'Máy lọc không khí Xiaomi Smart Air Purifier 4 Pro', 'Bộ lọc HEPA 3 lớp hiệu suất cao lọc sạch 99.97% bụi mịn PM2.5 và chất gây dị ứng, diện tích làm sạch đến 60m2, màn hình OLED cảm ứng thông minh.', 4490000.00, 8, 0, NOW(), NOW()),
(36, 'Máy hút bụi cầm tay không dây Dyson V12 Detect Slim', 'Động cơ Dyson Hyperdymium quay 125.000 vòng/phút, đầu hút laser phát hiện bụi bẩn vô hình siêu nhỏ, cảm biến piezo đếm và phân loại hạt bụi tự động.', 16990000.00, 8, 0, NOW(), NOW()),

-- Nhà cửa & Đời sống
(37, 'Ghế công thái học Ergonomic Chair Sihoo M57', 'Lưới thoáng khí toàn phần cao cấp bền bỉ không chùng, đệm đỡ thắt lưng tự điều chỉnh linh hoạt bảo vệ cột sống, tựa tay 3D đa hướng êm ái.', 3650000.00, 9, 0, NOW(), NOW()),
(38, 'Bộ ga gối cotton lụa Hàn Quốc 4 món', 'Chất liệu cotton lụa dệt mật độ sợi cao mềm mát dịu da, họa tiết dệt trang nhã hiện đại, kháng khuẩn chống nhăn và chống xù lông khi giặt máy.', 780000.00, 9, 0, NOW(), NOW()),
(39, 'Bình giữ nhiệt Lock&Lock Feather Light 500ml', 'Thép không gỉ Inox 304 tiêu chuẩn y tế giữ nóng đến 8 giờ và giữ lạnh đến 24 giờ, trọng lượng siêu nhẹ chỉ 200g, nắp vặn silicon kín khí chống tràn.', 329000.00, 9, 0, NOW(), NOW()),
(40, 'Đèn bàn học chống cận LED Panasonic 12W', 'Ánh sáng tỏa đều không nhấp nháy đạt chuẩn quang học an toàn cho mắt RG0, chỉ số hoàn màu CRI Ra>90 trung thực, cần đèn uốn gập xoay 360 độ linh hoạt.', 650000.00, 9, 0, NOW(), NOW()),

-- Bách hóa & Thực phẩm
(41, 'Cà phê hạt rang Arabica & Robusta Đắk Lắk 500g', 'Hạt cà phê hái chín 100% tuyển chọn từ vùng cao nguyên Đắk Lắk, rang mộc theo tiêu chuẩn Specialty, hương thơm đậm đà quyến rũ hậu vị ngọt sâu khó quên.', 165000.00, 10, 0, NOW(), NOW()),
(42, 'Hạt dinh dưỡng Granola mật ong sấy giòn 500g', 'Hỗn hợp yến mạch nguyên cám cùng hạnh nhân, hạt điều, óc chó và nho khô sấy giòn tẩm mật ong hoa rừng tự nhiên, giàu protein thực vật và chất xơ.', 145000.00, 10, 0, NOW(), NOW()),
(43, 'Trà Oolong Lâm Đồng hộp thiếc cao cấp 200g', 'Những búp trà non thu hái lúc sáng sớm trên đồi chè Cầu Đất, chế biến bán lên men chuẩn hương hoa lan thoang thoảng, nước trà vàng óng thanh tao ngọt lành.', 220000.00, 10, 0, NOW(), NOW()),
(44, 'Bánh quy bơ truyền thống Danisa hoàng gia 908g', 'Bánh quy bơ Đan Mạch lừng danh với công thức hoàng gia, hương bơ thơm ngậy giòn tan hòa quyện cùng hạt đường ngọt ngào, hộp thiếc sang trọng làm quà biếu ý nghĩa.', 245000.00, 10, 0, NOW(), NOW()),

-- Thể thao & Dã ngoại
(45, 'Thảm tập Yoga TPE 2 lớp định tuyến 8mm', 'Vật liệu TPE thân thiện môi trường đàn hồi cao, đường kẻ định tuyến laser chuẩn xác giúp căn chỉnh tư thế, bề mặt vân chống trượt bám dính tốt.', 299000.00, 11, 0, NOW(), NOW()),
(46, 'Giày chạy bộ nam Nike Air Zoom Pegasus 40', 'Bộ đôi túi khí Zoom Air ở mũi và gót chân cho độ bật nảy tối ưu, thân giày vải lưới engineered mesh thoáng khí ôm vừa vặn bàn chân suốt cự ly chạy dài.', 3290000.00, 11, 0, NOW(), NOW()),
(47, 'Lều dã ngoại tự bung chống mưa 4 người Naturehike', 'Cơ chế khớp bật thủy lực dựng lều chỉ trong 3 giây, vải Polyester 210T phủ lớp chống thấm PU 3000mm kèm chỉ số chống nắng UPF 50+, thông thoáng chống côn trùng.', 1650000.00, 11, 0, NOW(), NOW()),
(48, 'Vợt cầu lông Yonex Nanoflare 800 Play', 'Khung vợt Isometric mở rộng vùng điểm ngọt, công nghệ Sonic Flare System trợ lực đánh cầu siêu thanh thoát, trọng lượng 4U thân vợt dẻo dễ thuần.', 1250000.00, 11, 0, NOW(), NOW()),

-- Mẹ & Bé
(49, 'Sữa bột Meiji số 9 nội địa Nhật Bản 800g (1-3 tuổi)', 'Bổ sung đầy đủ sắt, canxi, DHA, ARA và 5 loại nucleotides hỗ trợ hệ tiêu hóa khỏe mạnh, tăng sức đề kháng và phát triển chiều cao trí não toàn diện.', 495000.00, 12, 0, NOW(), NOW()),
(50, 'Tã dán Bobby Lõi Nén Khí 3mm Mega Jumbo size L 68 miếng', 'Lõi nén ma thuật 3mm siêu mỏng thoáng, hàng triệu lỗ thoát khí li ti thấm hút tức thì chống tràn, bổ sung tinh chất trà xanh ngừa hăm tã hiệu quả.', 349000.00, 12, 0, NOW(), NOW()),
(51, 'Xe đẩy em bé gấp gọn hai chiều cao cấp', 'Khung hợp kim nhôm siêu nhẹ chỉ 5.8kg, đảo chiều tay đẩy linh hoạt, mái che vòm chống tia UV đa nấc, bánh xe giảm xóc lò xo xoắn êm ái.', 1850000.00, 12, 0, NOW(), NOW()),
(52, 'Bộ đồ chơi xếp hình sáng tạo LEGO Classic 900 chi tiết', 'Hộp gạch xây dựng đa sắc màu kích thích trí tưởng tượng vô hạn, nhựa ABS an toàn tuyệt đối cho trẻ nhỏ, đạt tiêu chuẩn chất lượng châu Âu.', 980000.00, 12, 0, NOW(), NOW()),

-- Sách & Văn phòng phẩm
(53, 'Bộ sách Tâm Lý Học Về Tiền & Tư Duy Nhanh Chậm', 'Combo 2 cuốn sách kinh điển về hành vi tài chính và tư duy con người của Morgan Housel và Daniel Kahneman, bìa cứng in dập nổi trang trọng.', 320000.00, 13, 0, NOW(), NOW()),
(54, 'Máy đọc sách Kindle Paperwhite Gen 11 16GB', 'Màn hình E-ink 6.8 inch 300 ppi sắc nét như trang giấy in thật, đèn nền vàng ấm chống mỏi mắt ban đêm, thời lượng pin đến 10 tuần, chuẩn kháng nước IPX8.', 3850000.00, 13, 0, NOW(), NOW()),
(55, 'Bút ký kim loại cao cấp Parker Sonnet mực gel', 'Thân bút phủ sơn mài đen bóng viền mạ vàng 23K sang trọng, ngòi bi trơn lướt êm ái chữ ký dứt khoát, đi kèm hộp đựng nhung quà biếu lịch sự.', 1250000.00, 13, 0, NOW(), NOW()),
(56, 'Balo học sinh sinh viên chống gù chống nước chống trộm', 'Vải Oxford cao cấp trượt nước, ngăn chống sốc chuyên dụng đựng laptop 15.6 inch, cổng sạc USB tích hợp bên hông, quai đeo đệm thoáng khí tổ ong.', 450000.00, 13, 0, NOW(), NOW())
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
(56, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80', 0);

-- 4. TỒN KHO SẢN PHẨM (INVENTORIES)
INSERT INTO inventories (product_id, quantity, reserved_quantity, created_at, updated_at) VALUES
(1, 25, 0, NOW(), NOW()),
(2, 15, 0, NOW(), NOW()),
(3, 18, 0, NOW(), NOW()),
(4, 12, 0, NOW(), NOW()),
(5, 8, 0, NOW(), NOW()),
(6, 20, 0, NOW(), NOW()),
(7, 14, 0, NOW(), NOW()),
(8, 10, 0, NOW(), NOW()),
(9, 6, 0, NOW(), NOW()),
(10, 9, 0, NOW(), NOW()),
(11, 12, 0, NOW(), NOW()),
(12, 30, 0, NOW(), NOW()),
(13, 22, 0, NOW(), NOW()),
(14, 35, 0, NOW(), NOW()),
(15, 16, 0, NOW(), NOW()),
(16, 50, 0, NOW(), NOW()),
(17, 80, 0, NOW(), NOW()),
(18, 40, 0, NOW(), NOW()),
(19, 45, 0, NOW(), NOW()),
(20, 25, 0, NOW(), NOW()),
(21, 30, 0, NOW(), NOW()),
(22, 38, 0, NOW(), NOW()),
(23, 55, 0, NOW(), NOW()),
(24, 18, 0, NOW(), NOW()),
(25, 14, 0, NOW(), NOW()),
(26, 22, 0, NOW(), NOW()),
(27, 8, 0, NOW(), NOW()),
(28, 40, 0, NOW(), NOW()),
(29, 65, 0, NOW(), NOW()),
(30, 90, 0, NOW(), NOW()),
(31, 70, 0, NOW(), NOW()),
(32, 15, 0, NOW(), NOW()),
(33, 18, 0, NOW(), NOW()),
(34, 24, 0, NOW(), NOW()),
(35, 15, 0, NOW(), NOW()),
(36, 7, 0, NOW(), NOW()),
(37, 22, 0, NOW(), NOW()),
(38, 35, 0, NOW(), NOW()),
(39, 60, 0, NOW(), NOW()),
(40, 40, 0, NOW(), NOW()),
(41, 100, 0, NOW(), NOW()),
(42, 85, 0, NOW(), NOW()),
(43, 45, 0, NOW(), NOW()),
(44, 60, 0, NOW(), NOW()),
(45, 50, 0, NOW(), NOW()),
(46, 26, 0, NOW(), NOW()),
(47, 15, 0, NOW(), NOW()),
(48, 20, 0, NOW(), NOW()),
(49, 55, 0, NOW(), NOW()),
(50, 70, 0, NOW(), NOW()),
(51, 12, 0, NOW(), NOW()),
(52, 30, 0, NOW(), NOW()),
(53, 60, 0, NOW(), NOW()),
(54, 18, 0, NOW(), NOW()),
(55, 25, 0, NOW(), NOW()),
(56, 45, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

-- 5. CHƯƠNG TRÌNH KHUYẾN MÃI FLASH SALE (FLASH_SALES)
INSERT INTO flash_sales (name, description, scope, discount_type, discount_value, start_at, end_at, is_active, is_deleted, created_at, updated_at) VALUES
('Đại Tiệc Mua Sắm Toàn Sàn 2026', 'Ưu đãi giảm giá 15% cho toàn bộ sản phẩm trên sàn nhân dịp khai trương mùa lễ hội', 'ALL', 'PERCENTAGE', 15.00, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 14 DAY), 1, 0, NOW(), NOW());

