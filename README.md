# Zodiac Dewey Miniapp

`Taro + React + TypeScript` 的双端小程序工程。

当前目标端：

- 微信小程序 `weapp`
- 抖音小程序 `tt`

## 项目定位

这个项目不是线上常驻服务，而是“小程序构建工程”。

它负责产出：

- 微信小程序构建包
- 抖音小程序构建包

## 本地开发

### 1. 启动后端

```powershell
cd D:\codex\zodiac\zodiac-dewey-backend\zodiac-dewey-backend
mvn clean package -DskipTests
java -jar target/zodiac-dewey.jar
```

后端默认地址：

```text
http://127.0.0.1:8080
```

### 2. 微信小程序 watch

```powershell
cd D:\codex\zodiac\zodiac-dewey-miniapp
npm install
npm run dev:weapp
```

### 3. 抖音小程序 watch

```powershell
cd D:\codex\zodiac\zodiac-dewey-miniapp
npm run dev:tt
```

## 构建命令

### 微信小程序

```powershell
npm run build:weapp
```

### 抖音小程序

```powershell
npm run build:tt
```

## Docker 用途

本项目的 Docker 不是常驻运行容器，而是统一构建环境。

### 构建微信小程序

```bash
docker build -t zodiac-miniapp-weapp --build-arg MINIAPP_TARGET=weapp .
```

### 构建抖音小程序

```bash
docker build -t zodiac-miniapp-tt --build-arg MINIAPP_TARGET=tt .
```

### 自定义 API 地址

```bash
docker build \
  -t zodiac-miniapp-weapp \
  --build-arg MINIAPP_TARGET=weapp \
  --build-arg TARO_APP_API_BASE=https://api.zodiac.njjyin.com \
  --build-arg TARO_APP_WEB_SHARE_BASE=https://zodiac.njjyin.com \
  .
```

## 开发者工具导入

### 微信开发者工具

- 导入目录：`D:/codex/zodiac/zodiac-dewey-miniapp`
- 构建产物目录：`dist`
- 项目配置文件：`project.config.json`

当前微信 AppID：

- `wx690bbfba5aa64abc`

### 抖音开发者工具

- 导入目录：`D:/codex/zodiac/zodiac-dewey-miniapp`
- 构建产物目录：`dist`
- 项目配置文件：`project.tt.json`

当前抖音配置使用：

- `touristappid`

这表示现在更偏本地开发 / 预览配置，正式上架前要替换成你的真实抖音小程序 AppID。

## 当前已完成

- 首页主题切换
- 免费版 / 深度解析切换
- 报告生成主链路接后端
- 报告页展示
- 分享页基础结构
- 微信 / 抖音双端构建脚本
- 微信 / 抖音项目配置文件

## 当前仍需继续完善

- 微信小程序真实支付接入
- 抖音小程序真实支付接入
- 双端返现账户与分享归因闭环
- 双端手机号授权与统一账户绑定
- 微信 / 抖音提审前的真机验收

## 生产建议

小程序发布链路建议为：

1. `backend` 单独发布
2. `frontend-h5` 单独发布
3. `miniapp` 走构建产物
4. 微信 / 抖音分别在各自开发者工具中上传与提审

也就是说：

- 后端、H5 是线上常驻服务
- 微信 / 抖音小程序不是常驻服务，而是构建产物
