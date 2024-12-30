# Tool Lọc Tên Nhân Vật

> Tool lọc tên nhân vật từ file text cho QuickTranslate - TangThuVien

[![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)](https://github.com/RenjiYuusei/QuickTranslatorFilterName)
[![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.0.0-brightgreen.svg)](https://bun.sh/)

## Tính năng

-   Lọc tên nhân vật từ file text (Hán Việt=Phiên âm)
-   Kiểm tra tên hợp lệ (viết hoa, độ dài, họ)
-   Loại bỏ trùng lặp và sắp xếp
-   Thống kê kết quả

## Cách dùng

```bash
node filter.js
```

## File kết quả

-   `Names.txt`: Kho tên đã lọc
-   `result_TenNhanVat.txt`: Danh sách tên
-   `result_TheoĐộDài_ViếtHoa.txt`: Lọc theo độ dài
-   `result_TheoTầnSuất_ViếtHoa.txt`: Lọc theo tần suất

[Xem thêm thay đổi](CHANGELOG.MD)
