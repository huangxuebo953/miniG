const ci = require('miniprogram-ci');
const path = require('path');

// 1. 创建项目对象
const project = new ci.Project({
  appid: 'wx394d03e2ddeaa121', // 替换成你的真实AppID
  type: 'miniProgram',
  projectPath: path.join(__dirname, './dist/dev/mp-weixin'), // 指向编译后的目录
  privateKeyPath: path.join(__dirname, './private.wx394d03e2ddeaa121.key'), // 刚才下载的密钥路径
  ignores: ['node_modules/**/*'],
});

// 2. 调用预览
async function preview() {
  const previewResult = await ci.preview({
    project,
    desc: 'Linux远程预览',
    setting: { es6: true },
    qrcodeFormat: 'terminal', // 关键：直接在终端打印二维码
    //qrcodeOutputDest: path.join(__dirname, './preview.jpg'), // 同时保存一张图
  });
  console.log('预览成功！请扫码：');
}

preview();
