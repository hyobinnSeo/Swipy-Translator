@echo off
echo Building client...
cd client
call npm run build
cd ..

echo Copying build files to server...
mkdir server\client
xcopy /E /I /Y client\build server\client\build

echo Deploying to Google Cloud...
gcloud app deploy server/app.yaml
