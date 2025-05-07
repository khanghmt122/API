const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits } = require('discord.js');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Đường dẫn đến file JSON
const dataFile = path.join(__dirname, 'views.json');
const ipFile = path.join(__dirname, 'viewed_ips.json');

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

function readIpData() {
    try {
        const data = fs.readFileSync(ipFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
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

function writeIpData(data) {
    fs.writeFileSync(ipFile, JSON.stringify(data, null, 2));
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
        const data = readData();
        const ipData = readIpData();
        const pageId = req.params.pageId;
        // Lấy IP thật sự từ x-forwarded-for (nếu có), fallback về remoteAddress
        let userIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.connection?.remoteAddress;
        if (userIp && userIp.includes(',')) {
            userIp = userIp.split(',')[0].trim();
        }
        console.log('IP truy cập:', userIp);

        if (!ipData[pageId]) ipData[pageId] = [];

        // Nếu IP đã tồn tại thì không tăng views
        if (ipData[pageId].includes(userIp)) {
            return res.json({ count: data[pageId] || 0 });
        }

        // Nếu là IP mới thì tăng views và lưu lại IP
        data[pageId] = (data[pageId] || 0) + 1;
        ipData[pageId].push(userIp);

        writeData(data);
        writeIpData(ipData);

        res.json({ count: data[pageId] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve khang.html cho route gốc
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'khang.html'));
});

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers
  ]
});

let latestStatus = {
  status: 'offline',
  activity: null,
  minutes: 0
};

const USER_ID = '877573003628670987';

client.on('ready', async () => {
  console.log(`Bot đã đăng nhập với tên ${client.user.tag}`);
  setInterval(updateStatus, 10000); // Cập nhật mỗi 10s
});

async function updateStatus() {
  try {
    // Lấy guild đầu tiên có tên là "Discord API"
    const guild = client.guilds.cache.find(g => g.name === 'Discord API');
    if (!guild) return;
    const member = await guild.members.fetch(USER_ID);
    const presence = member.presence;
    if (presence) {
      latestStatus.status = presence.status;
      const activity = presence.activities.find(a => a.type === 0 || a.type === 1); // Playing/Custom
      if (activity) {
        latestStatus.activity = activity.name;
        if (activity.timestamps && activity.timestamps.start) {
          latestStatus.minutes = Math.floor((Date.now() - activity.timestamps.start) / 60000);
        } else {
          latestStatus.minutes = 0;
        }
      } else {
        latestStatus.activity = null;
        latestStatus.minutes = 0;
      }
    } else {
      latestStatus.status = 'offline';
      latestStatus.activity = null;
      latestStatus.minutes = 0;
    }
  } catch (e) {
    console.error('Lỗi lấy status:', e);
  }
}

app.get('/status/:id', async (req, res) => {
  try {
    const guild = client.guilds.cache.find(g => g.name === 'Discord API');
    if (!guild) return res.json({ status: 'offline', activity: null, minutes: 0, avatar: null });
    const member = await guild.members.fetch(req.params.id);
    const presence = member.presence;
    if (presence) {
      let activity = null;
      let minutes = 0;
      const act = presence.activities.find(a => a.type === 0 || a.type === 1);
      if (act) {
        activity = act.name;
        if (act.timestamps && act.timestamps.start) {
          minutes = Math.floor((Date.now() - act.timestamps.start) / 60000);
        }
      }
      return res.json({
        status: presence.status,
        activity,
        minutes,
        avatar: member.user.avatar
      });
    } else {
      return res.json({ status: 'offline', activity: null, minutes: 0, avatar: null });
    }
  } catch (e) {
    return res.json({ status: 'offline', activity: null, minutes: 0, avatar: null });
  }
});

client.login(process.env.DISCORD_TOKEN);

app.listen(port, () => {
    console.log(`Server đang chạy tại port ${port}`);
    console.log('Đường dẫn file views.json:', dataFile);
}); 
