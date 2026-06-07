@echo off
echo Starting backend debug... > backend_debug.log
call mvn clean spring-boot:run -Dspring-boot.run.arguments=--server.port=9090 >> backend_debug.log 2>&1
echo Backend process finished with error level %ERRORLEVEL% >> backend_debug.log
