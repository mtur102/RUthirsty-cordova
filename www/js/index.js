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
    showDailyTip();
    checkBackupReminder();
}

// 绑定事件
function bindEvents() {
    // 打卡按钮
    document.getElementById('checkinBtn').addEventListener('click', addRecord);

    // 快速打卡按钮
    document.getElementById('quickAdd2').addEventListener('click', () => quickAddRecords(2));
    document.getElementById('quickAdd3').addEventListener('click', () => quickAddRecords(3));
    document.getElementById('quickAdd5').addEventListener('click', () => quickAddRecords(5));

    // 设置按钮
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    document.getElementById('closeSettings').addEventListener('click', closeSettingsModal);
    document.getElementById('cancelGoal').addEventListener('click', closeSettingsModal);
    document.getElementById('saveGoal').addEventListener('click', saveGoal);

    // 历史记录按钮
    document.getElementById('historyBtn').addEventListener('click', openHistoryModal);
    document.getElementById('closeHistory').addEventListener('click', closeHistoryModal);
    document.getElementById('closeHistoryBtn').addEventListener('click', closeHistoryModal);

    // 导出数据按钮
    document.getElementById('exportBtn').addEventListener('click', exportData);

    // 清空所有数据按钮
    document.getElementById('clearAllData').addEventListener('click', clearAllData);

    // 帮助按钮
    document.getElementById('helpBtn').addEventListener('click', openHelpModal);
    document.getElementById('closeHelp').addEventListener('click', closeHelpModal);
    document.getElementById('closeHelpBtn').addEventListener('click', closeHelpModal);

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

    document.getElementById('helpModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeHelpModal();
        }
    });

    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        // 空格键快速打卡（仅当没有模态框打开时）
        if (e.code === 'Space' && !document.querySelector('.modal.show')) {
            e.preventDefault();
            addRecord();
        }
        // ESC键关闭模态框
        if (e.code === 'Escape') {
            closeSettingsModal();
            closeHistoryModal();
            closeHelpModal();
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
        id: now.getTime() + '_' + Math.random().toString(36).substring(2, 11),
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

    // 检查是否完成目标
    checkGoalCompletion();
}

// 快速添加多条记录
function quickAddRecords(count) {
    const confirmed = confirm(`确定要一次性添加 ${count} 条打卡记录吗？`);
    if (!confirmed) return;

    const now = new Date();
    const baseTime = now.getTime();

    for (let i = 0; i < count; i++) {
        const record = {
            id: (baseTime + i) + '_' + Math.random().toString(36).substring(2, 11),
            timestamp: baseTime + i * 1000, // 每条记录间隔1秒
            date: getTodayDateString()
        };
        appData.records.push(record);
    }

    saveData();
    updateUI();

    // 显示提示
    showToast(`✓ 已添加 ${count} 条记录`, 'success');

    // 检查是否完成目标
    checkGoalCompletion();
}

// 检查目标完成情况
function checkGoalCompletion() {
    const todayRecords = getTodayRecords();
    const count = todayRecords.length;
    const goal = appData.settings.dailyGoal;

    // 如果刚好达到目标，显示祝贺消息
    if (count === goal) {
        showCongratulations();
    }
}

// 显示祝贺消息
function showCongratulations() {
    // 创建祝贺提示元素
    const congratsDiv = document.createElement('div');
    congratsDiv.className = 'congrats-message';
    congratsDiv.innerHTML = `
        <div class="congrats-content">
            <div class="congrats-icon">🎉</div>
            <div class="congrats-text">恭喜！今日目标已完成！</div>
            <div class="congrats-subtext">继续保持良好习惯</div>
        </div>
    `;

    document.body.appendChild(congratsDiv);

    // 3秒后自动消失
    setTimeout(() => {
        congratsDiv.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(congratsDiv);
        }, 300);
    }, 3000);
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
    updateOverallStats();
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
    const progressFill = document.getElementById('progressFill');
    progressFill.style.width = percent + '%';

    // 根据完成度改变进度条颜色
    if (percent >= 100) {
        progressFill.style.background = 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
    } else if (percent >= 75) {
        progressFill.style.background = 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)';
    } else if (percent >= 50) {
        progressFill.style.background = 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)';
    } else {
        progressFill.style.background = 'linear-gradient(90deg, #94a3b8 0%, #64748b 100%)';
    }
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

// 更新总体统计信息
function updateOverallStats() {
    // 总打卡次数
    const totalRecords = appData.records.length;
    document.getElementById('totalRecords').textContent = totalRecords;

    // 获取所有打卡日期（去重）
    const uniqueDates = [...new Set(appData.records.map(record => record.date))].sort();
    const totalDays = uniqueDates.length;
    document.getElementById('totalDays').textContent = totalDays;

    // 计算连续打卡天数
    const consecutiveDays = calculateConsecutiveDays(uniqueDates);
    document.getElementById('consecutiveDays').textContent = consecutiveDays;
}

// 计算连续打卡天数
function calculateConsecutiveDays(sortedDates) {
    if (sortedDates.length === 0) return 0;

    const today = getTodayDateString();
    let consecutive = 0;
    let currentDate = new Date(today);

    // 从今天开始往前检查
    for (let i = 0; i < 365; i++) {
        const dateString = currentDate.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '-');

        if (sortedDates.includes(dateString)) {
            consecutive++;
            // 往前推一天
            currentDate.setDate(currentDate.getDate() - 1);
        } else {
            // 如果是今天没有打卡，继续检查昨天
            if (i === 0 && dateString === today) {
                currentDate.setDate(currentDate.getDate() - 1);
                continue;
            }
            break;
        }
    }

    return consecutive;
}

// 导出数据功能
function exportData() {
    if (appData.records.length === 0) {
        alert('暂无数据可导出');
        return;
    }

    // 生成CSV格式数据
    let csvContent = '日期,时间,时间戳\n';

    // 按日期排序
    const sortedRecords = [...appData.records].sort((a, b) => a.timestamp - b.timestamp);

    sortedRecords.forEach(record => {
        const date = record.date;
        const time = new Date(record.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        csvContent += `${date},${time},${record.timestamp}\n`;
    });

    // 创建Blob并下载
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const filename = `RUthirsty_喝水记录_${getTodayDateString()}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 记录导出时间
    localStorage.setItem('ruthirsty_last_backup', Date.now().toString());

    // 显示成功提示
    showExportSuccess();
}

// 显示导出成功提示
function showExportSuccess() {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = '✓ 数据导出成功';

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// 清空所有数据
function clearAllData() {
    const confirmed = confirm('确定要清空所有数据吗？\n\n此操作将删除所有打卡记录，且无法恢复！\n\n建议先导出数据备份。');

    if (!confirmed) return;

    // 二次确认
    const doubleConfirm = confirm('最后确认：真的要删除所有数据吗？');

    if (!doubleConfirm) return;

    // 清空数据
    appData.records = [];
    appData.settings.dailyGoal = 8;
    saveData();

    // 关闭设置模态框
    closeSettingsModal();

    // 更新UI
    updateUI();

    // 显示提示
    showToast('所有数据已清空', 'warning');
}

// 通用Toast提示
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 2000);
}

// 显示每日提示语
function showDailyTip() {
    const tips = [
        '💧 每天8杯水，健康好身体',
        '🌟 坚持喝水，皮肤更水润',
        '💪 充足水分，提升工作效率',
        '🎯 养成好习惯，从喝水开始',
        '☀️ 早起一杯水，唤醒新一天',
        '🏃 运动后记得补充水分',
        '📚 学习时多喝水，大脑更清醒',
        '🌈 每一滴水都是对自己的关爱',
        '⏰ 定时喝水，身体更健康',
        '🎉 今天也要好好喝水哦',
        '💝 爱自己，从喝水开始',
        '🌸 水是生命之源，别忘了喝水',
        '🔥 保持水分，代谢更顺畅',
        '🌙 睡前一小时，记得喝点水',
        '🎨 喝水让思维更活跃'
    ];

    // 根据日期选择提示语（每天不同）
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    const tipIndex = dayOfYear % tips.length;

    document.getElementById('dailyTip').textContent = tips[tipIndex];
}

// 检查备份提醒
function checkBackupReminder() {
    // 如果记录超过100条，且最近30天没有导出过，提醒用户备份
    const totalRecords = appData.records.length;
    if (totalRecords < 100) return;

    const lastBackup = localStorage.getItem('ruthirsty_last_backup');
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    if (!lastBackup || (now - parseInt(lastBackup)) > thirtyDays) {
        setTimeout(() => {
            const shouldBackup = confirm(
                `您已有 ${totalRecords} 条打卡记录！\n\n为了数据安全，建议定期导出备份。\n\n是否现在导出数据？`
            );
            if (shouldBackup) {
                exportData();
                localStorage.setItem('ruthirsty_last_backup', now.toString());
            }
        }, 2000);
    }
}

// 打开帮助模态框
function openHelpModal() {
    document.getElementById('helpModal').classList.add('show');
}

// 关闭帮助模态框
function closeHelpModal() {
    document.getElementById('helpModal').classList.remove('show');
}

// 将deleteRecord函数暴露到全局作用域，以便HTML onclick可以调用
window.deleteRecord = deleteRecord;
