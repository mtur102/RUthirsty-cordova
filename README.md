# RUthirsty - 喝水打卡应用

一个简洁实用的喝水打卡Cordova应用，帮助你养成良好的喝水习惯。

## 功能特性

- ✅ **一键打卡** - 大按钮设计，轻松记录每次喝水
- ✅ **今日统计** - 实时显示今日喝水次数和完成进度
- ✅ **目标设置** - 自定义每日喝水目标（1-20杯）
- ✅ **进度可视化** - 直观的进度条显示完成情况
- ✅ **记录管理** - 查看今日记录，支持删除误操作
- ✅ **历史查看** - 按日期分组查看所有历史记录
- ✅ **数据持久化** - 使用localStorage本地存储，数据不丢失
- ✅ **简洁界面** - 清新的紫色渐变主题，简洁实用

## 快速开始

### 在浏览器中测试

1. 启动本地开发服务器：
```bash
cd www
python3 -m http.server 8000
```

2. 在浏览器中访问：`http://localhost:8000`

### 构建Android应用

#### 前置要求

- Node.js 和 npm
- Cordova CLI (`npm install -g cordova`)
- Android SDK（需要设置 ANDROID_HOME 环境变量）
- Java JDK

#### 构建步骤

1. 安装依赖：
```bash
npm install
```

2. 添加Android平台（如果还没有）：
```bash
cordova platform add android
```

3. 构建APK：
```bash
cordova build android
```

4. 运行到设备或模拟器：
```bash
cordova run android
```

生成的APK文件位于：`platforms/android/app/build/outputs/apk/`

## 使用说明

### 打卡喝水

点击中央的大圆形"打卡喝水"按钮，即可记录一次喝水。按钮会有动画反馈，记录会立即显示在下方列表中。

### 设置目标

1. 点击"设置"按钮
2. 输入每日目标杯数（1-20）
3. 点击"保存"

进度条会根据目标自动更新完成百分比。

### 查看记录

- **今日记录**：主界面下方显示今天的所有打卡记录，按时间倒序排列
- **历史记录**：点击"查看历史记录"按钮，可以查看所有历史数据，按日期分组显示

### 删除记录

每条记录右侧都有"删除"按钮，点击后确认即可删除该记录。

## 技术栈

- **框架**：Apache Cordova
- **前端**：原生 HTML5 + CSS3 + JavaScript
- **存储**：localStorage
- **平台**：Android（可扩展到iOS）

## 项目结构

```
RUthirsty-cordova/
├── www/                    # Web资源目录
│   ├── index.html         # 主界面
│   ├── css/
│   │   └── index.css      # 样式文件
│   ├── js/
│   │   └── index.js       # 应用逻辑
│   └── img/
│       └── logo.png       # 应用图标
├── platforms/             # 平台特定代码
│   └── android/          # Android平台
├── config.xml            # Cordova配置文件
└── package.json          # 项目依赖
```

## 数据存储

应用使用localStorage存储数据，数据结构如下：

```javascript
{
  "records": [
    {
      "id": "timestamp_random",
      "timestamp": 1707307825000,
      "date": "2026-02-07"
    }
  ],
  "settings": {
    "dailyGoal": 8
  }
}
```

## 开发说明

### 修改代码后测试

1. 修改 `www/` 目录下的文件
2. 在浏览器中刷新页面即可看到效果
3. 或重新构建Android应用：`cordova build android`

### 添加新功能

可以考虑的功能扩展：

- 定时提醒功能（需要 cordova-plugin-local-notification）
- 水量记录（记录每次喝水的毫升数）
- 数据统计图表（周统计、月统计）
- 云同步功能
- 深色模式
- 成就系统

## 注意事项

### Android SDK 配置

如果构建Android应用时遇到 "ANDROID_HOME not found" 错误，需要：

1. 安装 Android SDK
2. 设置环境变量：
```bash
export ANDROID_HOME=/path/to/android-sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### 在GitHub Codespaces中

当前开发环境配置了Android SDK feature，但可能需要重新构建容器才能使用。如果无法构建Android应用，可以：

1. 在浏览器中测试所有功能
2. 在本地环境中构建Android应用
3. 或使用在线构建服务（如 PhoneGap Build）

## 许可证

本项目基于 Apache License 2.0 开源。

## 作者

开发者：Claude Sonnet 4.5

---

**祝你养成良好的喝水习惯！💧**
