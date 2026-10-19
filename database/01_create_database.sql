/* ==========================================================================
   FILE: 01_create_database.sql
   PROJECT: Laptop Shop Management System (SBA301)
   TARGET DBMS: Microsoft SQL Server
   DESCRIPTION:
     - Kiểm tra và tạo mới database LaptopShopDB nếu chưa tồn tại.
     - TUYỆT ĐỐI KHÔNG DROP database hoặc ghi đè dữ liệu hiện có.
   ========================================================================== */

USE [master];
GO

IF DB_ID(N'LaptopShopDB') IS NULL
BEGIN
    PRINT N'Đang khởi tạo database [LaptopShopDB]...';
    CREATE DATABASE [LaptopShopDB];
    PRINT N'Đã tạo database [LaptopShopDB] thành công.';
END
ELSE
BEGIN
    PRINT N'CẢNH BÁO: Database [LaptopShopDB] đã tồn tại. Giữ nguyên database hiện có, không thực hiện ghi đè.';
END
GO

USE [LaptopShopDB];
GO

SELECT
    DB_ID(N'LaptopShopDB') AS [DatabaseId],
    DB_NAME()              AS [CurrentDatabase],
    SYSDATETIME()          AS [VerifiedAt];
GO
