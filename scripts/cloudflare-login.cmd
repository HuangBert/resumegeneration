@echo off
set "XDG_CONFIG_HOME=%~dp0..\.wrangler-config"
npx.cmd wrangler login --browser=false
