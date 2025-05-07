const API_URL = 'http://localhost:3000/api';

async function updateViewCount() {
    try {
        // Lấy số lượt xem hiện tại
        const response = await fetch(`${API_URL}/views/khang-page`);
        const data = await response.json();
        document.getElementById('viewCount').textContent = data.count;

        // Tăng lượt xem
        await fetch(`${API_URL}/views/khang-page/increment`, {
            method: 'POST'
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật lượt xem:', error);
    }
}

// Cập nhật lượt xem khi trang được tải
document.addEventListener('DOMContentLoaded', updateViewCount); 