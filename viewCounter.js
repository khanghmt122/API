const API_URL = 'https://khanghmt122.onrender.com/api';

async function updateViewCount() {
    try {
        // Lấy số lượt xem hiện tại
        const response = await fetch(`${API_URL}/views/khanghmt122`);
        const data = await response.json();
        document.getElementById('viewCount').textContent = data.count;

        // Tăng lượt xem
        await fetch(`${API_URL}/views/khanghmt122/increment`, {
            method: 'POST'
        });
    } catch (error) {
        console.error('Lỗi khi cập nhật lượt xem:', error);
    }
}

// Cập nhật lượt xem khi trang được tải
document.addEventListener('DOMContentLoaded', updateViewCount); 