@echo off
echo Cleaning up previous build...
cd client
rd /s /q build 2>nul
call npm run build
cd ..

echo Copying build files to server...
rd /s /q server\client\build 2>nul
mkdir server\client 2>nul
xcopy /E /I /Y client\build server\client\build

echo Deploying to Google Cloud...
gcloud app deploy server/app.yaml --project swipy-translator
