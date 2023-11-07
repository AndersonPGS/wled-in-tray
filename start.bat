if not "%minimized%"=="" goto :minimized
set minimized=true
@echo off

start /min cmd /C "node pm2_start"
goto :EOF
:minimized