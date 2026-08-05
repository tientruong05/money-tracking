# Product Requirements Document

## Money Tracker PWA — App quản lý tài chính cá nhân

**Phiên bản:** 1.0
**Ngày:** 04/08/2026
**Đối tượng sử dụng:** Chỉ 1 người dùng duy nhất (personal use), không public

---

## 1. Tổng quan

### 1.1 Mục tiêu

Xây dựng một Progressive Web App (PWA) quản lý tài chính cá nhân, hoạt động ổn định cả khi có mạng lẫn khi mất mạng, cài đặt được lên iPhone qua "Add to Home Screen" mà không cần publish lên App Store.

### 1.2 Nguyên tắc thiết kế cốt lõi

- **Local-first**: UI luôn đọc/ghi từ IndexedDB (local), không bao giờ chờ mạng để hiển thị dữ liệu.
- **Offline = mặc định, không phải trường hợp đặc biệt**: app phải hoạt động đầy đủ 100% tính năng nhập liệu khi không có mạng.
- **Optimistic UI**: mọi thao tác nhập liệu phản ánh lên màn hình ngay lập tức, không có trạng thái loading khi ghi dữ liệu.
- **Mobile-first, desktop-capable**: thiết kế tối ưu cho điện thoại (thao tác hàng ngày), nhưng vẫn dùng tốt trên desktop (xem báo cáo).

### 1.3 Ngoài phạm vi (Non-goals) của bản v1

- Không hỗ trợ nhiều người dùng / chia sẻ dữ liệu giữa nhiều tài khoản.
- Không xuất báo cáo (Excel/CSV/PDF) — có thể cân nhắc ở version sau.
- Không có giao dịch định kỳ tự động (recurring transactions) — để version sau.
- Không hỗ trợ đa ngôn ngữ — chỉ tiếng Việt.

---

## 2. Tính năng chi tiết

### 2.1 Ví / Nguồn tiền (Wallets)

- Người dùng tạo được nhiều ví: tiền mặt, ngân hàng, ví điện tử (Momo, ZaloPay...).
- Mỗi ví có: tên, loại, icon, màu, số dư ban đầu.
- **Icon ví dùng ảnh thật (PNG/SVG logo), không dùng icon font/emoji chung chung** — ví dụ ví "Momo" dùng đúng logo Momo, ví "Vietcombank" dùng đúng logo VCB, thay vì icon "ví tiền" generic. Ở bước implement, danh sách logo cụ thể cho từng ngân hàng/ví điện tử sẽ do người code tự tìm asset và thêm vào sau (không cần chốt trước trong PRD này) — chỉ cần đảm bảo kiến trúc hỗ trợ `icon` là đường dẫn ảnh (image path/URL), không phải tên icon trong 1 bộ icon font cố định.
- Số dư hiện tại (`current_balance`) được **tính động** từ tổng các giao dịch, không lưu cứng — tránh lệch số khi đồng bộ.
- Chuyển tiền giữa 2 ví (transfer) — không tính là thu/chi, không ảnh hưởng tổng tài sản, chỉ dịch chuyển số dư.
- Xem tổng tài sản (tổng tất cả ví) ở màn hình chính.

### 2.2 Danh mục (Categories)

- Danh mục mặc định (loại chi tiêu): Ăn sáng, Ăn trưa, Ăn chiều, Ăn xế, Đi chợ, Mua sắm.
- Danh mục mặc định (loại thu nhập): Lương, Thu nhập khác (có thể mở rộng).
- Người dùng thêm/sửa/ẩn danh mục tùy ý (custom category), chọn icon + màu riêng.
- Mỗi danh mục chi tiêu có thể gán **ngân sách giới hạn** theo tháng (optional).
- **Riêng 4 danh mục ăn uống (Ăn sáng/trưa/chiều/xế)**: có thêm chế độ nhập nhanh "Cứu đói" — xem chi tiết ở mục 2.3.

### 2.3 Giao dịch (Transactions)

3 loại: **Thu nhập / Chi tiêu / Chuyển khoản (transfer)**.

Khi nhập giao dịch cần: số tiền, ví áp dụng, danh mục (không cần nếu là transfer), mô tả, ngày (mặc định hôm nay).

**Hành vi nhập liệu (bắt buộc):**

1. Ghi vào IndexedDB ngay lập tức → UI cập nhật tức thì, không có độ trễ.
2. Nếu có mạng: đẩy lên Supabase nền, **không hiện thông báo gì** nếu thành công.
3. Nếu không có mạng (hoặc mạng có nhưng đẩy lỗi): hiện toast nhỏ "Đã lưu — sẽ đồng bộ khi có mạng", giao dịch vẫn hiển thị đầy đủ trên màn hình như bình thường.
4. Khi mạng có lại: tự động đẩy các giao dịch đang chờ (sync queue), không cần người dùng làm gì.

- Sửa/xóa được giao dịch bất kỳ lúc nào (kể cả giao dịch chưa kịp đồng bộ).
- Danh sách giao dịch lọc theo ví, theo danh mục, theo khoảng thời gian.

**Chế độ "Cứu đói" (riêng cho 4 danh mục ăn uống):**
Khi chọn 1 trong 4 danh mục Ăn sáng/Ăn trưa/Ăn chiều/Ăn xế, màn hình nhập liệu hiện thêm 2 lựa chọn nhanh thay vì bắt nhập số tiền ngay:

- **Nhập số tiền** — luồng bình thường, trừ tiền vào ví như các giao dịch khác.
- **Cứu đói** (ăn ké người quen, không tốn tiền) — chọn xong là lưu giao dịch luôn, `amount = 0`, không trừ ví, mô tả tự điền "Cứu đói" (sửa được), **không cần** chọn ví. Mục đích: vẫn ghi lại được là "hôm nay có ăn sáng" để không bị trống lịch sử, nhưng không ảnh hưởng số dư hay tính vào ngân sách.
- Data model: thêm field `is_free_meal` (boolean) trên `transactions` để phân biệt và có thể thống kê sau này (VD: "tháng này cứu đói bao nhiêu bữa").

### 2.4 Ngân sách (Budget)

- Đặt giới hạn chi tiêu theo tháng cho từng danh mục.
- **Tính tổng across tất cả ví** (VD: ngân sách "Ăn uống" 3 triệu/tháng tính chung dù trả bằng tiền mặt hay chuyển khoản) — vì đây là cách nghĩ tự nhiên về ngân sách, không phụ thuộc nguồn tiền.
- Cảnh báo khi:
  - Đạt ~80% ngân sách → cảnh báo màu vàng/cam.
  - Vượt ngân sách → cảnh báo màu đỏ, hiển thị rõ trên danh mục đó.
- Transfer giữa các ví **không** tính vào ngân sách (không phải thu/chi thực).

### 2.5 Báo cáo (Reports)

- **Trên điện thoại**: tổng quan nhanh — số dư, chi tiêu hôm nay/tuần này, tiến độ ngân sách theo danh mục.
- **Trên desktop** (màn hình lớn hơn, dùng để "ngồi xem lại"):
  - Biểu đồ tròn: tỷ trọng chi tiêu theo danh mục trong tháng.
  - Biểu đồ đường/cột: xu hướng thu — chi theo thời gian (theo ngày/tuần/tháng).
  - Bảng chi tiết: liệt kê đầy đủ giao dịch, sắp xếp/lọc được theo ví, danh mục, khoảng thời gian.
  - Không cần chức năng xuất file ở bản v1.

### 2.6 Xác thực (Authentication)

- Đăng nhập bằng **email + password** (Supabase Auth).
- Tùy chọn "Ghi nhớ đăng nhập" — mặc định bật, vì app chỉ 1 người dùng trên thiết bị riêng.
- **Mở khóa app bằng Face ID / Touch ID** (WebAuthn) thay vì nhập lại password mỗi lần mở app — xem chi tiết luồng ở mục 4.4.

---

## 3. Kiến trúc kỹ thuật

### 3.1 Sơ đồ tổng quan

```
[Supabase: Postgres + Auth]
        ⇅ (sync khi có mạng, background)
[IndexedDB (Dexie.js)] ← nguồn sự thật duy nhất cho UI
        ⇅ (đọc/ghi trực tiếp, luôn luôn)
[UI — React/Next.js, qua Dexie liveQuery]
```

UI **không bao giờ** gọi thẳng Supabase để render dữ liệu. Mọi read đều qua Dexie (`useLiveQuery`), giúp UI tự động cập nhật bất kể dữ liệu đến từ thao tác tay hay từ sync nền.

### 3.2 Data Model (rút gọn)

| Bảng           | Trường chính                                                                                                                          | Ghi chú                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `wallets`      | id, name, type, icon (image path/URL), color, initial_balance                                                                         | `current_balance` tính động, không lưu. `icon` trỏ tới ảnh PNG/SVG logo thật (Momo, VCB...), asset do người code bổ sung sau |
| `categories`   | id, name, type (income/expense), icon, color, is_default, budget_limit                                                                | budget_limit null nếu không đặt                                                                                              |
| `transactions` | id, wallet_id, category_id, type (income/expense/transfer), amount, description, date, to_wallet_id, is_free_meal, synced, updated_at | `to_wallet_id` chỉ dùng khi transfer. `is_free_meal` chỉ áp dụng cho danh mục ăn uống, mặc định false                        |

### 3.3 Cơ chế Offline

| Tầng                     | Nhiệm vụ                                   | Công nghệ                                                           |
| ------------------------ | ------------------------------------------ | ------------------------------------------------------------------- |
| App Shell (UI load được) | Cache HTML/CSS/JS                          | Service Worker (Workbox / `next-pwa`)                               |
| Data hiển thị            | UI luôn có dữ liệu để render               | Dexie.js (IndexedDB) + `liveQuery`                                  |
| Data mới nhất            | Đồng bộ khi có mạng                        | Supabase + hàm sync nền                                             |
| Sync queue               | Đảm bảo không mất dữ liệu nhập lúc offline | Field `synced: false` trên transaction, flush khi có event `online` |

### 3.4 Xung đột đồng bộ (Conflict resolution)

Vì chỉ 1 người dùng nhưng có thể dùng nhiều thiết bị (điện thoại + desktop xem report), cần chiến lược đơn giản: **Last-write-wins theo `updated_at`**. Nếu 1 giao dịch bị sửa ở 2 nơi trước khi kịp sync, bản có `updated_at` mới hơn sẽ thắng. Vì đây là app cá nhân, tần suất conflict thực tế gần như không đáng kể, nên không cần cơ chế merge phức tạp.

---

## 4. UI/UX Requirements

### 4.1 Định hướng thiết kế

- **Mobile-first**: layout chính thiết kế cho màn hình điện thoại (thao tác 1 tay, vùng chạm lớn, thanh điều hướng dưới cùng).
- **Desktop**: layout responsive mở rộng thêm cột/panel để tận dụng không gian màn hình lớn khi xem report — không phải chỉ là bản mobile phóng to.
- **Theme**: sáng (light theme), tông màu chủ đạo **xanh lá nhạt**.
  - Primary: xanh lá vừa (`#22C55E`) cho nút hành động chính, số dư dương.
  - Accent nhạt: xanh lá pastel (`#86EFAC` / nền `#F0FDF4`) cho background thẻ, highlight.
  - Chi tiêu: dùng màu tương phản ấm (đỏ cam `#F97316`/`#EF4444`) để phân biệt rõ thu/chi.
  - Cảnh báo vượt ngân sách: đỏ (`#EF4444`).
- **Panel/Option**: mọi panel lựa chọn (chọn ví, chọn danh mục, thêm giao dịch, cài đặt...) hiển thị dạng **bottom sheet trồi từ dưới lên**, không dùng modal giữa màn hình hay dropdown truyền thống.
- **Animation**: chuyển động mượt cho mọi tương tác (mở/đóng bottom sheet, chuyển tab, số dư thay đổi, thao tác vuốt xóa...).

### 4.2 Thư viện đề xuất

| Nhu cầu              | Thư viện                     | Lý do                                                                                                          |
| -------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Animation            | **Motion** (Framer Motion)   | Chuẩn cho React/Next.js, hỗ trợ gesture, transition mượt, dùng được cho bottom sheet                           |
| Bottom sheet         | **Vaul**                     | Chuyên dụng cho drawer trồi từ dưới lên kiểu iOS, tích hợp tốt với shadcn/ui, hỗ trợ kéo-thả (drag to dismiss) |
| Notification (toast) | **Sonner**                   | Nhẹ, đẹp, dễ tùy biến theme, phù hợp thông báo ngắn kiểu "đã lưu offline"                                      |
| UI components        | **shadcn/ui** + Tailwind CSS | Dễ tùy biến theo theme màu riêng, không bị "khung" cứng như UI kit đóng gói                                    |
| Biểu đồ (report)     | **Recharts**                 | Pie chart + line/bar chart, tương thích React tốt                                                              |

### 4.3 Màn hình chính (đề xuất)

1. **Dashboard** (mobile): tổng tài sản, nút thêm giao dịch nổi bật (FAB), danh sách giao dịch gần đây, tiến độ ngân sách rút gọn.
2. **Thêm giao dịch**: bottom sheet — chọn loại (thu/chi/chuyển), danh mục (dạng lưới icon) trước, sau đó số tiền (bàn phím số lớn), ví, mô tả, ngày. Riêng khi chọn 1 trong 4 danh mục ăn uống → hiện thêm 2 nút nhanh "Nhập số tiền" / "Cứu đói" trước khi vào form đầy đủ (xem mục 2.3).
3. **Ví**: danh sách ví + số dư từng ví, thêm/sửa ví.
4. **Ngân sách**: danh sách danh mục có đặt ngân sách, thanh tiến độ, cảnh báo màu.
5. **Report** (desktop-optimized, vẫn xem được trên mobile ở dạng rút gọn): biểu đồ + bảng chi tiết.
6. **Cài đặt**: quản lý danh mục, đăng xuất, bật/tắt Face ID.

### 4.4 Luồng xác thực chi tiết

```
Lần đầu cài app
  → Đăng nhập email/password (cần mạng, qua Supabase Auth)
  → Session (JWT) lưu cache trong IndexedDB/localStorage
  → Đề nghị đăng ký Face ID/Touch ID (WebAuthn) để mở khóa nhanh lần sau

Những lần mở app sau
  → App đọc session cache (không cần gọi mạng để biết "đã đăng nhập")
  → Yêu cầu xác thực Face ID/Touch ID (navigator.credentials.get)
    → Xác thực bằng phần cứng thiết bị (Secure Enclave), chạy hoàn toàn local, KHÔNG cần mạng
  → Xác thực thành công → mở khóa UI, hiển thị dữ liệu từ Dexie ngay lập tức
  → Nếu có mạng ở nền: session tự refresh, sync dữ liệu chạy song song
```

**Lưu ý kỹ thuật quan trọng (cần validate sớm khi build):**
Safari trên iOS <cite index="1-1">hỗ trợ WebAuthn cho xác thực không cần mật khẩu</cite>, kể cả khi chạy như PWA standalone. Tuy nhiên có ghi nhận một số trường hợp WebAuthn/Face ID hoạt động không ổn định khi app chạy trong chế độ standalone/wrapped khác với tab Safari thông thường. → **Khuyến nghị: làm 1 spike nhỏ (1-2 giờ) test WebAuthn thật trên iPhone của bạn ở chế độ "Add to Home Screen" trước khi build toàn bộ luồng auth**, để chắc chắn tính năng này khả thi trên đúng thiết bị/phiên bản iOS bạn dùng. Nếu không ổn định, phương án fallback là PIN riêng cho app (lưu hash local, không cần mạng, không phụ thuộc WebAuthn).

---

## 5. Tech Stack tổng hợp

| Layer              | Công nghệ                                           |
| ------------------ | --------------------------------------------------- |
| Framework          | Next.js (App Router) + TypeScript                   |
| Styling            | Tailwind CSS + shadcn/ui                            |
| Animation          | Motion (Framer Motion)                              |
| Bottom sheet       | Vaul                                                |
| Notification       | Sonner                                              |
| Local DB           | Dexie.js (IndexedDB)                                |
| Backend/DB         | Supabase (Postgres + Auth + Row Level Security)     |
| Biểu đồ            | Recharts                                            |
| Auth sinh trắc học | WebAuthn (Web Authentication API)                   |
| PWA / Offline      | Service Worker qua `next-pwa` hoặc Workbox thủ công |
| Hosting            | Vercel                                              |

---

## 6. Yêu cầu phi chức năng (Non-functional)

- **Độ trễ nhập liệu**: từ lúc nhấn "Lưu" đến lúc hiển thị trên UI phải tức thì (< 100ms), không phụ thuộc trạng thái mạng.
- **Độ tin cậy offline**: app phải mở được và dùng đầy đủ tính năng nhập liệu dù mất mạng hoàn toàn, kể cả sau khi tắt app hoàn toàn rồi mở lại.
- **Bảo toàn dữ liệu**: không được mất giao dịch đã nhập trong bất kỳ trường hợp nào (mất mạng giữa chừng, đóng app đột ngột, chuyển đổi mạng...).
- **Responsive**: hoạt động tốt từ màn hình 375px (iPhone SE) đến desktop 1920px+.

---

## 7. Rủi ro & Vấn đề cần theo dõi

| Rủi ro                                                 | Mức độ                          | Ghi chú                                                   |
| ------------------------------------------------------ | ------------------------------- | --------------------------------------------------------- |
| WebAuthn không ổn định trong PWA standalone trên iOS   | Trung bình                      | Cần spike test sớm (mục 4.4), có fallback PIN             |
| Safari ITP xóa IndexedDB nếu app không mở >7 ngày      | Thấp (app dùng hàng ngày)       | Cân nhắc Persistent Storage API để giảm rủi ro bị dọn dẹp |
| Không publish App Store → phải tự "Add to Home Screen" | Không phải rủi ro, đã chấp nhận | Đây là lựa chọn chủ động ban đầu                          |

---

_Document này là bản nháp làm việc — có thể điều chỉnh khi bắt đầu implement và phát hiện constraint thực tế (đặc biệt là phần WebAuthn trên iOS)._
