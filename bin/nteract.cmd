@echo off
set /p < %~dp0nteract-env
%NTERACT_CMD% %*
