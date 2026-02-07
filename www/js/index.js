/**
 * RUthirsty 喝水打卡应用
 * 主要功能：打卡、记录、统计、目标设置、历史查看
 */

// 应用数据
let appData = {
    records: [],
    settings: {
        dailyGoal: 8
    }
};

// 存储键名
const STORAGE_KEY = 'ruthirsty_data';

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initApp();
});

// Cordova设备就绪事件
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    console.log('Cordova is ready');
}

// 初始化应用
function initApp() {
    loadData();
    bindEvents();
    updateUI();
}

// 绑定事件
function bindEvents() {
    // 打卡按钮
    document.getElementById('checkinBtn').addEventListener('click', addRecord);

    // 设置按钮
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    document.getElementById('closeSettings').addEventListener('click', closeSettingsModal);
    document.getElementById('cancelGoal').addEventListener('click', closeSettingsModal);
    document.getElementById('saveGoal').addEventListener('click', saveGoal);

    // 历史记录按钮
    document.getElementById('historyBtn').addEventListener('click', openHistoryModal);
    document.getElementById('closeHistory').addEventListener('click', closeHistoryModal);
    document.getElementById('closeHistoryBtn').addEventListener('click', closeHistoryModal);

    // 点击模态框背景关闭
    document.getElementById('settingsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeSettingsModal();
        }
    });

    document.getElementById('historyModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeHistoryModal();
        }
    });
}

// 从localStorage加载数据
function loadData() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            appData = JSON.parse(stored);
            // 确保数据结构完整
            if (!appData.records) appData.records = [];
            if (!appData.settings) appData.settings = { dailyGoal: 8 };
            if (!appData.settings.dailyGoal) appData.settings.dailyGoal = 8;
        }
    } catch (error) {
        console.error('加载数据失败:', error);
        appData = {
            records: [],
            settings: { dailyGoal: 8 }
        };
    }
}

// 保存数据到localStorage
function saveData() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (error) {
        console.error('保存数据失败:', error);
        alert('保存数据失败，请检查存储空间');
    }
}

// 获取今天的日期字符串 (YYYY-MM-DD)
function getTodayDateString() {
    const today = new Date();
    return today.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).replace(/\//g, '-');
}

// 获取今日记录
function getTodayRecords() {
    const today = getTodayDateString();
    return appData.records.filter(record => record.date === today);
}

// 获取指定日期的记录
function getRecordsByDate(dateString) {
    return appData.records.filter(record => record.date === dateString);
}

// 添加打卡记录
function addRecord() {
    const now = new Date();
    const record = {
        id: now.getTime() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: now.getTime(),
        date: getTodayDateString()
    };

    appData.records.push(record);
    saveData();

    // 添加成功动画
    const btn = document.getElementById('checkinBtn');
    btn.classList.add('success-animation');
    setTimeout(() => {
        btn.classList.remove('success-animation');
    }, 300);

    updateUI();
}

// 删除记录
function deleteRecord(recordId) {
    if (confirm('确定要删除这条记录吗？')) {
        appData.records = appData.records.filter(record => record.id !== recordId);
        saveData();
        updateUI();

        // 如果历史记录模态框是打开的，更新历史记录显示
        const historyModal = document.getElementById('historyModal');
        if (historyModal.classList.contains('show')) {
            renderHistoryList();
        }
    }
}

// 更新UI
function updateUI() {
    updateStats();
    renderTodayRecords();
}

// 更新统计信息
function updateStats() {
    const todayRecords = getTodayRecords();
    const count = todayRecords.length;
    const goal = appData.settings.dailyGoal;
    const percent = Math.min(Math.round((count / goal) * 100), 100);

    // 更新显示
    document.getElementById('dailyGoal').textContent = goal;
    document.getElementById('goalDisplay').textContent = goal;
    document.getElementById('todayCount').textContent = count;
    document.getElementById('recordCount').textContent = count;
    document.getElementById('progressPercent').textContent = percent;

    // 更新进度条
    document.getElementById('progressFill').style.width = percent + '%';
}

// 渲染今日记录列表
function renderTodayRecords() {
    const todayRecords = getTodayRecords();
    const recordsList = document.getElementById('recordsList');

    if (todayRecords.length === 0) {
        recordsList.innerHTML = '<p class="empty-message">今天还没有喝水记录，点击上方按钮开始打卡吧！</p>';
        return;
    }

    // 按时间倒序排列（最新的在前）
    todayRecords.sort((a, b) => b.timestamp - a.timestamp);

    let html = '';
    todayRecords.forEach(record => {
        const time = new Date(record.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        html += `
            <div class="record-item">
                <span class="record-time">${time}</span>
                <button class="delete-btn" onclick="deleteRecord('${record.id}')">删除</button>
            </div>
        `;
    });

    recordsList.innerHTML = html;
}

// 打开设置模态框
function openSettingsModal() {
    document.getElementById('goalInput').value = appData.settings.dailyGoal;
    document.getElementById('settingsModal').classList.add('show');
}

// 关闭设置模态框
function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('show');
}

// 保存目标设置
function saveGoal() {
    const input = document.getElementById('goalInput');
    const goal = parseInt(input.value);

    if (isNaN(goal) || goal < 1 || goal > 20) {
        alert('请输入1-20之间的数字');
        return;
    }

    appData.settings.dailyGoal = goal;
    saveData();
    updateStats();
    closeSettingsModal();
}

// 打开历史记录模态框
function openHistoryModal() {
    renderHistoryList();
    document.getElementById('historyModal').classList.add('show');
}

// 关闭历史记录模态框
function closeHistoryModal() {
    document.getElementById('historyModal').classList.remove('show');
}

// 渲染历史记录列表
function renderHistoryList() {
    const historyList = document.getElementById('historyList');

    if (appData.records.length === 0) {
        historyList.innerHTML = '<p class="empty-message">暂无历史记录</p>';
        return;
    }

    // 按日期分组
    const recordsByDate = {};
    appData.records.forEach(record => {
        if (!recordsByDate[record.date]) {
            recordsByDate[record.date] = [];
        }
        recordsByDate[record.date].push(record);
    });

    // 获取所有日期并排序（最新的在前）
    const dates = Object.keys(recordsByDate).sort((a, b) => {
        return new Date(b) - new Date(a);
    });

    let html = '';
    dates.forEach(date => {
        const records = recordsByDate[date];
        const count = records.length;

        // 格式化日期显示
        const dateObj = new Date(date);
        const dateDisplay = dateObj.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });

        html += `
            <div class="history-date-group">
                <div class="history-date-header">
                    ${dateDisplay}
                    <span class="history-date-count">(${count}次)</span>
                </div>
        `;

        // 按时间倒序排列
        records.sort((a, b) => b.timestamp - a.timestamp);

        records.forEach(record => {
            const time = new Date(record.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            html += `
                <div class="history-record-item">
                    <span class="history-record-time">${time}</span>
                    <button class="delete-btn" onclick="deleteRecord('${record.id}')">删除</button>
                </div>
            `;
        });

        html += '</div>';
    });

    historyList.innerHTML = html;
}

// 将deleteRecord函数暴露到全局作用域，以便HTML onclick可以调用
window.deleteRecord = deleteRecord;
