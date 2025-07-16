# 私钥导入功能实现

## 概述

本功能在MetaMask扩展的onboarding流程中添加了通过私钥导入钱包的能力。用户现在可以选择通过私钥而不是助记词来导入现有的钱包。

## 功能特性

1. **私钥验证**: 支持64位十六进制字符串格式的私钥，可带或不带0x前缀
2. **安全性**: 私钥输入框默认隐藏，提供显示/隐藏切换功能
3. **用户体验**: 与现有的助记词导入流程保持一致的用户界面
4. **错误处理**: 提供清晰的错误提示信息
5. **多语言支持**: 支持英文和中文界面

## 实现文件

### 核心组件

- `ui/pages/onboarding-flow/import-private-key/import-private-key.tsx` - 私钥导入页面组件
- `ui/pages/onboarding-flow/welcome/welcome-login.tsx` - 欢迎页面，添加私钥导入按钮
- `ui/pages/onboarding-flow/welcome/welcome.js` - 欢迎页面逻辑，处理私钥导入路由
- `ui/pages/onboarding-flow/onboarding-flow.js` - 主流程组件，添加私钥导入路由和处理逻辑
- `ui/pages/onboarding-flow/create-password/create-password.js` - 密码创建页面，支持私钥导入流程

### 路由配置

- `ui/helpers/constants/routes.ts` - 添加新的私钥导入路由常量

### 本地化

- `app/_locales/en/messages.json` - 英文本地化字符串
- `app/_locales/zh_CN/messages.json` - 中文本地化字符串

### 测试

- `ui/pages/onboarding-flow/import-private-key/import-private-key.test.tsx` - 私钥导入组件测试

## 使用流程

1. 用户在欢迎页面选择"通过私钥导入"
2. 跳转到私钥输入页面
3. 用户输入私钥（支持带或不带0x前缀）
4. 系统验证私钥格式
5. 跳转到密码创建页面
6. 用户设置密码
7. 系统创建新钱包并导入私钥账户
8. 完成onboarding流程

## 技术实现

### 私钥验证

```typescript
const validatePrivateKey = (key) => {
  if (!key || key.trim() === '') {
    return t('privateKeyRequired');
  }

  const cleanKey = key.startsWith('0x') ? key.slice(2) : key;
  if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) {
    return t('invalidPrivateKeyFormat');
  }

  return '';
};
```

### 私钥导入逻辑

```typescript
const handleImportWithPrivateKey = async (password, pk) => {
  try {
    // 首先创建新钱包
    await dispatch(createNewVaultAndGetSeedPhrase(password));

    // 然后导入私钥作为额外账户
    await dispatch(
      actions.importNewAccount('privateKey', [pk], 'Importing private key...'),
    );

    return true;
  } catch (error) {
    console.error('Error importing private key:', error);
    throw error;
  }
};
```

## 安全考虑

1. **私钥保护**: 私钥输入框默认隐藏，提供显示/隐藏功能
2. **本地处理**: 私钥验证和处理都在本地进行，不会发送到服务器
3. **错误处理**: 提供清晰的错误信息，避免暴露敏感信息
4. **用户教育**: 在界面中提醒用户保护私钥安全

## 测试覆盖

- 组件渲染测试
- 私钥格式验证测试
- 有效私钥处理测试（带和不带0x前缀）
- 显示/隐藏私钥功能测试
- 错误处理测试

## 本地化字符串

### 英文
- `onboardingImportPrivateKey`: "Import with private key"
- `privateKeyRequired`: "Private key is required"
- `invalidPrivateKeyFormat`: "Invalid private key format. Please enter a valid 64-character hexadecimal string."

### 中文
- `onboardingImportPrivateKey`: "通过私钥导入"
- `privateKeyRequired`: "私钥是必需的"
- `invalidPrivateKeyFormat`: "私钥格式无效。请输入有效的64位十六进制字符串。"

## 未来改进

1. **更多格式支持**: 支持其他私钥格式（如WIF）
2. **批量导入**: 支持一次导入多个私钥
3. **硬件钱包集成**: 与硬件钱包的私钥导入集成
4. **增强验证**: 添加更严格的私钥有效性检查
5. **用户反馈**: 添加导入进度指示器和成功提示
