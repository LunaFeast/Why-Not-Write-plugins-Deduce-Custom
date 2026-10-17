/* wnw-custom 这一家自己的出包命令（插件分离第 5 批）
   ------------------------------------------------------------
     node 出包.mjs                      主程序那一棵就在上一格（<开发那一摊>\flow-desk）时
     node 出包.mjs --主仓=一处目录        主程序那一棵在别处
     node 出包.mjs --出=一处目录          容器要落在别处（默认落本仓 dist\\）

   两步：第一步出这一家自己那颗内核（产物不进版本，由这一条命令现出，出完铺进运行时那一格）；
   第二步找到主程序那一颗打包手，把本仓这一格交给它压，压完把信息段念回来。
   这一份**不签名、不加密**：那两样都住在发布那一层，插件这一侧不许有（第 3 批 3.3 乙）。
   找不到打包手就当场停：宁可打不出包，也不许自己抄一份"看着像"的压法。
   本仓的位置自己认（拿这份文件所在那一格），这台机器的路径一个字都不写进来；
   主程序那一棵的位置按三步找：环境变量 FD_MAIN → 旁边的默认那一棵 → --主仓=，都不中就停下来问。 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const 仓 = path.dirname(fileURLToPath(import.meta.url));
const 格 = path.join(仓, 'data', 'plugins', "wnw-custom");
const 叫 = (args) => execFileSync('git', ['-C', 仓, ...args], { encoding: 'utf8' });
/* 第一步 · 内核：这一家自己出。有落盘的出内核那颗就跑它再拷过来；
   没有那颗、只有一段现拼的函数（声笔练习那种）就 import 进来现场拼。 */
const 内 = {"出":"src/_wcustom/build-kernel.mjs","产物":"src/_wcustom/wnw-custom-kernel.js","装名":"wnw-custom-kernel.js"};
if(内){
  fs.mkdirSync(格, { recursive: true });
  if(内.出){
    execFileSync(process.execPath, [内.出], { cwd: 仓, stdio: 'inherit' });
    const 品 = path.join(仓, 内.产物);
    if(!fs.existsSync(品)) throw new Error('出内核那一趟跑完了，产物却不在：' + 内.产物);
    fs.copyFileSync(品, path.join(格, 内.装名));
    console.log('内核出好了 · ' + 内.产物 + ' → data\\plugins\\' + "wnw-custom" + '\\' + 内.装名);
  } else if(内.那颗){
    const { rpKernelSource } = await import(pathToFileURL(path.join(仓, 内.那颗)).href);
    const 单 = JSON.parse(fs.readFileSync(path.join(格, 'manifest.json'), 'utf8'));
    const 文 = rpKernelSource({ version: 单.version });
    fs.writeFileSync(path.join(格, 内.装名), 文);
    console.log('内核出好了（源码那几份现场拼的一段）· ' + 内.装名 + ' ' + Buffer.byteLength(文) + ' 字节');
  } else throw new Error('这一家的内核那一格写得不全：既没有"出"也没有"那颗"');
}
const 猜 = [process.env.FD_MAIN, path.join(path.dirname(path.dirname(仓)), 'flow-desk')]   /* 主程序那一棵在插件格上面那一格，名字只从 布局.mjs 那一处来 */
  .filter(Boolean).map(x => path.resolve(x));
const 主 = (() => {
  const 项 = process.argv.find(a => a.startsWith('--主仓='));
  /* 给了 --主仓= 也要验一眼那一格里到底有没有那颗打包手：不验的话，写错一格就撞进一句模块找不到的话，
     读的人不知道是路径写错了 —— 停下来的那一句得说人话，还要把他给的那一格念出来 */
  if(项){
    const 指 = path.resolve(项.slice('--主仓='.length));
    if(!fs.existsSync(path.join(指, 'src', '_build', 'packbox.mjs')))
      throw new Error('找不到主程序那一颗打包手：--主仓= 给的是「' + 指 + '」，那一格里没有 src\\_build\\packbox.mjs。'
        + '主程序那一棵在别处就把那一格指过来（这一家不自己压）。');
    return 指;
  }
  const 中 = 猜.find(x => fs.existsSync(path.join(x, 'src', '_build', 'packbox.mjs')));
  if(!中) throw new Error('找不到主程序那一颗打包手（试过：' + 猜.join(' 、 ') + '）。'
    + '给一条 --主仓=Flow-Desk 那一棵的目录 就行 —— 这一家不自己压。');
  return 中;
})();
const 手 = await import(pathToFileURL(path.join(主, 'src', '_build', 'packbox.mjs')).href);
/* 号从**自己这一仓**那一笔取（插件的更新管自己，主程序 publish 那一套号不互抄）：
   git 叫不到就退回仓里那一格写着的号，并把这一句念出来 —— 「问不出」与「问出来是空的」是两件事。
   铺一份到 dist\摊开\ 再改那一份的号：仓里进版本的 manifest.json 一个字不动。 */
let 短 = '', 号话 = '';
try{ 短 = 叫(['rev-parse', '--short', 'HEAD']).trim(); }
catch(e){ 号话 = '问不出这一仓的哈希（' + String((e && (e.stderr || e.message)) || e).split(/\r?\n/)[0] + '），号照仓里那一格写着的用'; }
const 摊 = path.join(仓, 'dist', '摊开', "wnw-custom");
fs.rmSync(摊, { recursive: true, force: true });
fs.cpSync(格, 摊, { recursive: true });
const 单 = JSON.parse(fs.readFileSync(path.join(摊, 'manifest.json'), 'utf8'));
if(短){ 单.version = String(单.version || '1.0.0-alpha').split('+')[0] + '+build.' + 短;
  fs.writeFileSync(path.join(摊, 'manifest.json'), JSON.stringify(单, null, 2) + '\n'); }
console.log('号 · 这一仓那一笔 ' + (短 || '(问不出)') + ' → ' + 单.version + (号话 ? '（' + 号话 + '）' : ''));
const 打 = 手.打目录(摊);
const 出 = path.resolve((process.argv.find(a => a.startsWith('--出=')) || '').slice('--出='.length)
  || path.join(仓, 'dist'));
fs.mkdirSync(出, { recursive: true });
/* 后缀不写在这一份里：全仓唯一那一枚住在壳里（pack_box::扩展名），问打包手要（它自己去读那一处） */
const 件 = path.join(出, "wnw-custom" + '.' + 手.扩展名());
fs.writeFileSync(件, 打.字节);
const 份 = 打.信息.files.map(x => '    ' + x.path + ' · ' + x.len + ' 字节 · ' + x.sha256.slice(0, 12) + '…');
console.log('WROTE ' + 件 + '  ' + 打.字节.length + ' 字节');
console.log('信息段：' + 打.信息.id + ' · ' + 打.信息.name + ' · ' + 打.信息.version
  + ' · 要求壳 ' + 打.信息.min_shell + ' · 来源 ' + 打.信息.source + ' · 钥匙 ' + 打.信息.key_id + '（这一版不签不加密）');
console.log('里面这几份：\n' + 份.join('\n'));
