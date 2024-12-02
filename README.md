# 🎯 Tool Lọc Tên Nhân Vật ✨

> 🔍 Tool lọc tên nhân vật từ file text cho QuickTranslate - TangThuVien 📚

[![Version](https://img.shields.io/badge/version-1.3.0-blue.svg)](https://github.com/RenjiYuusei/QuickTranslatorFilterName)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

## 👨‍💻 Tác giả

-   🌟 Đoàn Đình Hoàng
-   📧 [Email](daoluc.yy@gmail.com) | 🌐 [Facebook](https://www.facebook.com/RenjiYuusei)

## 🌈 Tính năng

-   📝 Lọc tên nhân vật từ file text theo định dạng "Hán Việt=Phiên âm"
-   ✨ Kiểm tra tính hợp lệ của tên (viết hoa, độ dài, họ hợp lệ)
-   🔄 Loại bỏ trùng lặp và sắp xếp theo alphabet
-   📊 Thống kê kết quả xử lý chi tiết

## 🚀 Cài đặt

1. 📥 Cài đặt [Node.js](https://nodejs.org/en/download/) (phiên bản 18 trở lên)
2. ⚡ Tải và cài đặt Node.js về máy
3. 🔗 Clone repository này về máy

## 🎮 Chạy Tool

⚠️ Phải đúng thư mục có file `filter.js`
💻 Mở terminal và chạy lệnh:

```
node filter.js
```

## 📑 Các Tệp Tin Quan Trọng 🗂️

-   📝 `Names.txt`: Kho lưu trữ tên nhân vật đã được lọc ✨
-   📊 `result_TenNhanVat.txt`: Tệp kết quả chứa danh sách tên nhân vật 🎯
-   📏 `result_TheoĐộDài_ViếtHoa.txt`: Tệp lọc tên theo độ dài và chuẩn hóa viết hoa 📐
-   📈 `result_TheoTầnSuất_ViếtHoa.txt`: Tệp lọc tên theo tần suất xuất hiện và viết hoa 📊

## 🎉 Lịch Sử Cập Nhật 🚀

-   ✨ Phiên Bản 1.3.0:
    -   🔍 Thông minh hơn với khả năng kiểm tra và bỏ qua tên đã tồn tại trong Names.txt
    -   📊 Bổ sung tính năng phân tích và lọc tên theo tần suất xuất hiện
    -   🛠️ Khắc phục các lỗi trong quá trình lọc tên
    -   🎯 Tối ưu hóa bộ lọc bằng cách loại bỏ regex và cải thiện chuẩn hóa tên
