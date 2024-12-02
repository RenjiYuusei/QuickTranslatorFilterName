# 🎯 Tool Lọc Tên Nhân Vật

> Tool lọc tên nhân vật từ file text cho QuickTranslate - TangThuVien

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](https://github.com/RenjiYuusei/QuickTranslatorFilterName)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

## 📌 Tác giả

-   Đoàn Đình Hoàng
-   [Email](daoluc.yy@gmail.com) | [Facebook](https://www.facebook.com/RenjiYuusei)

## ✨ Tính năng

-   📝 Lọc tên nhân vật từ file text theo định dạng "Hán Việt=Phiên âm"
-   ✅ Kiểm tra tính hợp lệ của tên (viết hoa, độ dài, họ hợp lệ)
-   🔄 Loại bỏ trùng lặp và sắp xếp theo alphabet
-   📊 Thống kê kết quả xử lý chi tiết

## 🚀 Cài đặt

1. Cài đặt [Node.js](https://nodejs.org/en/download/) (phiên bản 18 trở lên)
2. Tải và cài đặt Node.js về máy
3. Clone repository này về máy

## 📄 Chạy Tool

Phải đúng thư mục có file `filter.js`
Mở terminal và chạy lệnh:

```
node filter.js
```

## 📄 Cách tệp tin

-   `Names.txt`: Tệp tin chứa tên nhân vật đã lọc\
-   `result_TenNhanVat.txt`: Tệp tin kết quả lọc tên nhân vật
-   `result_TheoĐộDài_ViếtHoa.txt`: Tệp tin kết quả lọc tên nhân vật theo độ dài và viết hoa
-   `result_TheoTầnSuất_ViếtHoa.txt`: Tệp tin kết quả lọc tên nhân vật theo tần suất và viết hoa

## 📄 Các thay đổi

-   1.3.0:
    -   Thêm kiểm tra tên đã tồn tại trong file Names.txt nếu có thì sẽ nhận diện và bỏ qua
    -   Thêm tính năng lọc tên nhân vật theo tần suất xuất hiện
    -   Sửa lỗi khi lọc tên nhân vật
    -   Xóa regex và chuẩn hóa tên nhân vật để lọc tên nhân vật hoạt động tốt hơn
