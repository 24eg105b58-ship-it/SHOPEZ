@echo off
echo =====================================================================
echo                 SHOPEZ - PREMIUM MERN STOREFRONT
echo =====================================================================
echo.
echo [1/2] Starting MERN Express Backend API (Port 5000)...
start "SHOPEZ Backend Server" cmd.exe /k "cd server && npm start"
echo.
echo [2/2] Starting React Vite Client (Port 5173)...
start "SHOPEZ Client Server" cmd.exe /k "cd client && npm run dev"
echo.
echo =====================================================================
echo  Both services launched in separate console windows!
echo  - Express REST Backend: http://localhost:5000
echo  - React Storefront Client: http://localhost:5173
echo =====================================================================
echo.
pause
