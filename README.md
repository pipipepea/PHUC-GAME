# 🚀 NEON JUMPER

**Neon Jumper** là một tựa game platformer vô tận (endless jumper) mang đậm phong cách Cyberpunk và Neon. Trò chơi không chỉ thử thách phản xạ của bạn mà còn mang đến những cơ chế điều khiển đột phá nhờ tận dụng tối đa các cảm biến phần cứng trên thiết bị.

---

## ✨ Tính Năng Nổi Bật

- **Đồ họa Neon & Hiệu ứng ấn tượng:** Trải nghiệm thị giác mượt mà với dải đuôi sáng (trail) uyển chuyển và cơ chế "tiến hóa" đổi màu nhân vật theo điểm số.
- **Multiplayer P2P (Chơi cùng bạn bè):** Tích hợp thư viện `PeerJS` cho phép tạo phòng và kết nối chơi đôi thời gian thực vô cùng nhanh chóng mà không cần máy chủ trung gian.
- **Tương tác phần cứng (Hardware API):** 
  - Hỗ trợ **Cảm biến nghiêng (Gyroscope)** trên điện thoại để điều khiển.
  - Hỗ trợ **Microphone**: Nhặt vật phẩm và "thổi" vào mic để giúp nhân vật bay lên.
- **Độ khó động:** Khoảng cách các bệ đỡ thay đổi liên tục dựa trên điểm số hiện tại của người chơi.
- **Bảng Xếp Hạng (Leaderboard):** Tích hợp Google Sheets API để lưu và vinh danh TOP 10 người chơi có điểm số cao nhất.

---

## 🎮 Cách Điều Khiển

Tựa game hỗ trợ đa nền tảng (PC & Mobile) với các phương thức điều khiển linh hoạt:

* **Trên PC:** Di chuyển **Chuột** sang trái/phải để điều hướng nhân vật.
* **Trên Mobile/Tablet:** **Chạm và vuốt** ngón tay trên màn hình sang trái/phải.
* **Chế độ Cảm Biến Lắc (Gyroscope):** Nhấn vào biểu tượng 📱 ở góc phải màn hình, sau đó **Nghiêng điện thoại** sang trái/phải để nhân vật di chuyển theo. *(Mẹo: Chơi bằng cảm biến lắc sẽ được nhân đôi điểm số!)*
* **Chế độ Thổi Mic:** Khi nhặt đủ 3 vật phẩm 🎤, hãy **thổi mạnh vào Micro** của thiết bị để kích hoạt lực đẩy phản lực.

---

## 🎁 Hệ Thống Vật Phẩm (Power-ups)

Trong quá trình leo cao, bạn sẽ bắt gặp các bệ đỡ chứa vật phẩm đặc biệt:

- 🚀 **Tên lửa:** Nhặt đủ 6 cái để bay vút lên cao không giới hạn trong một khoảng thời gian.
- ⚔️ **Cuồng sát:** Dải đuôi của bạn sẽ chuyển đỏ. Trong chế độ Multiplayer, nếu đồng đội chạm vào đuôi của bạn, họ sẽ "bay màu"!
- 💖 **Trái tim:** Tích lũy để thêm mạng (tối đa 4 mạng). Nếu đang chơi 2 người và đồng đội đã chết, nhặt tim sẽ hồi sinh đồng đội ngay lập tức.
- ❄️ **Đóng băng:** Làm chậm tốc độ di chuyển của các bệ đỡ.
- 🕸️ **Người nhện:** Bắn tơ kéo bạn lên các bệ đỡ cao hơn một cách an toàn.
- ⚡ **Thu nhỏ (Xanh dương):** Giảm kích thước nhân vật giúp né tránh dễ hơn và tăng sức nhảy.

---

## 🛠️ Cài đặt & Khởi chạy (Dành cho Developer)

Dự án được xây dựng hoàn toàn bằng HTML5, CSS3 và Vanilla JavaScript, áp dụng cơ chế Fixed Time Step cho vật lý game. Không cần cài đặt thư viện phức tạp.

1. Clone repository này về máy:
   ```bash
   git clone [https://github.com/pipipepea/PHUC-GAME.git](https://github.com/pipipepea/PHUC-GAME.git)