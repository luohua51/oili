Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "      会员管理系统 - 一键启动脚本" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$nodePath = Get-Command node -ErrorAction SilentlyContinue
if ($nodePath) {
    Write-Host "[OK] Node.js 已安装" -ForegroundColor Green
    $nodeVersion = node --version
    Write-Host "     版本: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Node.js 未安装，请先安装 Node.js" -ForegroundColor Red
    Write-Host "        下载地址: https://nodejs.org/zh-cn/download/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "按任意键退出..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "[INFO] 检查 npm 是否可用..." -ForegroundColor Yellow
$npmPath = Get-Command npm -ErrorAction SilentlyContinue
if ($npmPath) {
    Write-Host "[OK] npm 已安装" -ForegroundColor Green
} else {
    Write-Host "[ERROR] npm 不可用，请检查 Node.js 安装" -ForegroundColor Red
    Write-Host "按任意键退出..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "[INFO] 安装项目依赖..." -ForegroundColor Yellow
npm.cmd install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] 依赖安装失败" -ForegroundColor Red
    Write-Host "按任意键退出..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}
Write-Host "[OK] 依赖安装成功" -ForegroundColor Green

Write-Host ""
Write-Host "[INFO] 启动后端服务 (端口: 3001)..." -ForegroundColor Yellow
Start-Process npm.cmd -ArgumentList "run dev:backend" -WorkingDirectory $PWD
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "[INFO] 启动前端开发服务器 (端口: 5173)..." -ForegroundColor Yellow
Start-Process npm.cmd -ArgumentList "run dev:frontend" -WorkingDirectory $PWD
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "      服务启动完成！" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "前端地址: http://localhost:5173" -ForegroundColor Yellow
Write-Host "后端地址: http://localhost:3001" -ForegroundColor Yellow
Write-Host ""
Write-Host "测试账号:" -ForegroundColor White
Write-Host "  管理员: admin / 123456" -ForegroundColor White
Write-Host "  会员1:  member1 / 123456" -ForegroundColor White
Write-Host "  会员2:  member2 / 123456" -ForegroundColor White
Write-Host ""
Write-Host "按任意键打开浏览器..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Start-Process "http://localhost:5173"