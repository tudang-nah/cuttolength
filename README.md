# Cut to length

Mô phỏng hoạt ảnh máy cắt vải theo chiều dài (Unidrive SP + Unimotor), vẽ bằng SVG và JavaScript thuần, không cần thư viện hay bước build.

## Cấu trúc

- `index.html` – trang chính
- `style.css` – giao diện
- `script.js` – dựng cảnh isometric và hoạt ảnh

## Chạy thử trên máy

Mở thẳng file `index.html` bằng trình duyệt, hoặc chạy server nhỏ:

```bash
python3 -m http.server 8000
```

rồi vào http://localhost:8000

## Đưa lên GitHub Pages

1. Tạo repo mới trên GitHub, upload 4 file trong thư mục này lên nhánh `main` (để ở thư mục gốc của repo).
2. Vào **Settings → Pages**.
3. Ở mục **Build and deployment**, chọn **Deploy from a branch**, nhánh `main`, thư mục `/ (root)`, bấm **Save**.
4. Đợi khoảng 1 phút, trang sẽ chạy tại `https://<tên-github>.github.io/<tên-repo>/`.
