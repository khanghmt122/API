const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Đường dẫn đến file JSON
const dataFile = path.join(__dirname, 'views.json');

// Khởi tạo file JSON nếu chưa tồn tại
try {
    if (!fs.existsSync(dataFile)) {
        console.log('Tạo file views.json mới');
        fs.writeFileSync(dataFile, JSON.stringify({}));
    }
} catch (error) {
    console.error('Lỗi khi khởi tạo file views.json:', error);
}

// Đọc dữ liệu từ file
function readData() {
    try {
        const data = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Lỗi khi đọc file views.json:', error);
        return {};
    }
}

// Ghi dữ liệu vào file
function writeData(data) {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Lỗi khi ghi file views.json:', error);
        throw error;
    }
}

// API endpoints
app.get('/api/views/:pageId', (req, res) => {
    try {
        console.log('Nhận request GET cho pageId:', req.params.pageId);
        const data = readData();
        const pageId = req.params.pageId;
        const count = data[pageId] || 0;
        console.log('Trả về số lượt xem:', count);
        res.json({ count });
    } catch (error) {
        console.error('Lỗi trong GET /api/views/:pageId:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/views/:pageId/increment', (req, res) => {
    try {
        console.log('Nhận request POST cho pageId:', req.params.pageId);
        const data = readData();
        const pageId = req.params.pageId;
        data[pageId] = (data[pageId] || 0) + 1;
        writeData(data);
        console.log('Đã tăng lượt xem lên:', data[pageId]);
        res.json({ count: data[pageId] });
    } catch (error) {
        console.error('Lỗi trong POST /api/views/:pageId/increment:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve khang.html cho route gốc
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'khang.html'));
});

app.listen(port, () => {
    console.log(`Server đang chạy tại port ${port}`);
    console.log('Đường dẫn file views.json:', dataFile);
}); 