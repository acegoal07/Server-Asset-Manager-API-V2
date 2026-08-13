-- ===========================================================
-- Redfish Database Schema
-- MySQL 8+
-- ===========================================================
DROP DATABASE IF EXISTS redfish;
CREATE DATABASE redfish CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE redfish;
-- ===========================================================
-- Groups
-- ===========================================================
CREATE TABLE Groups (
   id INT AUTO_INCREMENT PRIMARY KEY,
   name varchar(255) NOT NULL UNIQUE,
   nameMask varchar(255) NOT NULL,
   ipMask varchar(255) NOT NULL,
   bmcUsername varchar(255) NOT NULL,
   bmcPassword varchar(255) NOT NULL,
   bmcIpMask varchar(255) NOT NULL
);
-- ===========================================================
-- Asset Types
-- ===========================================================
CREATE TABLE AssetTypes (
   id INT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255) UNIQUE
);
-- ===========================================================
-- Assets
-- ===========================================================
CREATE TABLE Assets (
   id INT AUTO_INCREMENT PRIMARY KEY,
   groupId INT NULL,
   name VARCHAR(255) NOT NULL,
   notes TEXT NULL,
   uTop INT NOT NULL DEFAULT 0,
   uBottom INT NOT NULL DEFAULT 0,
   uSize INT NOT NULL DEFAULT 1,
   assetTypeId INT,
   CONSTRAINT uq_group_name UNIQUE (groupId, name),
   CONSTRAINT fk_assets_assetType FOREIGN KEY (assetTypeId) REFERENCES AssetTypes (id) ON DELETE
   SET NULL
);
-- ===========================================================
-- Asset Type Fields
-- ===========================================================
CREATE TABLE AssetTypeFields (
   id INT AUTO_INCREMENT PRIMARY KEY,
   assetTypeId INT NOT NULL,
   name VARCHAR(255),
   type VARCHAR(255),
   fixed boolean DEFAULT 0,
   CONSTRAINT fk_assetTypeField_assetType FOREIGN KEY (assetTypeId) REFERENCES AssetTypes (id) ON DELETE CASCADE,
   CONSTRAINT uq_assetTypeField_name UNIQUE (assetTypeId, name)
);
-- ===========================================================
-- Asset Data
-- ===========================================================
CREATE TABLE AssetData (
   id INT AUTO_INCREMENT PRIMARY KEY,
   assetId INT NOT NULL,
   fieldId INT NOT NULL,
   value VARCHAR(255),
   CONSTRAINT uq_asset_field UNIQUE (assetId, fieldId),
   CONSTRAINT fk_assetData_asset FOREIGN KEY (assetId) REFERENCES Assets (id) ON DELETE CASCADE,
   CONSTRAINT fk_assetData_field FOREIGN KEY (fieldId) REFERENCES AssetTypeFields (id) ON DELETE CASCADE
);
-- ===========================================================
-- Storage Types
-- ===========================================================
CREATE TABLE StorageTypes (
   id INT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255) UNIQUE
);
-- ===========================================================
-- Storages
-- ===========================================================
CREATE TABLE Storages (
   id INT AUTO_INCREMENT PRIMARY KEY,
   name VARCHAR(255) NOT NULL,
   notes TEXT NULL,
   storageTypeId INT,
   CONSTRAINT fk_storages_storageType FOREIGN KEY (storageTypeId) REFERENCES StorageTypes (id) ON DELETE
   SET NULL
);
-- ===========================================================
-- Storage Type Fields
-- ===========================================================
CREATE TABLE StorageTypeFields (
   id INT AUTO_INCREMENT PRIMARY KEY,
   storageTypeId INT NOT NULL,
   name VARCHAR(255),
   type VARCHAR(255),
   fixed boolean DEFAULT 0,
   CONSTRAINT fk_storageTypeField_storageType FOREIGN KEY (storageTypeId) REFERENCES StorageTypes (id) ON DELETE CASCADE,
   CONSTRAINT uq_storageTypeField_name UNIQUE (storageTypeId, name)
);
-- ===========================================================
-- Asset Data
-- ===========================================================
CREATE TABLE StorageData (
   id INT AUTO_INCREMENT PRIMARY KEY,
   storageId INT NOT NULL,
   fieldId INT NOT NULL,
   value VARCHAR(255),
   CONSTRAINT uq_storage_field UNIQUE (storageId, fieldId),
   CONSTRAINT fk_storageData_storage FOREIGN KEY (storageId) REFERENCES Storages (id) ON DELETE CASCADE,
   CONSTRAINT fk_storageData_field FOREIGN KEY (fieldId) REFERENCES StorageTypeFields (id) ON DELETE CASCADE
);
-- ===========================================================
-- Seed Asset Types
-- ===========================================================
INSERT INTO AssetTypes (id, name)
VALUES (1, 'Server'),
   (3, 'Storage Array'),
   (4, 'Network Switch'),
   (5, 'PDU'),
   (6, 'Blanking Plate'),
   (7, 'UPS'),
   (8, 'RPS'),
   (9, 'KVM'),
   (10, 'Brush Panel');
-- ===========================================================
-- Server
-- ===========================================================
INSERT INTO AssetTypeFields (assetTypeId, name, type)
VALUES (1, 'Hostname', 'string'),
   (1, 'Manufacturer', 'string'),
   (1, 'Model', 'string'),
   (1, 'CPU Cores', 'number'),
   (1, 'RAM GB', 'number'),
   (1, 'Operating System', 'string'),
   (1, 'Virtualized', 'boolean'),
   (1, 'Installation Date', 'date');
-- ===========================================================
-- Storage Array
-- ===========================================================
INSERT INTO AssetTypeFields (assetTypeId, name, type)
VALUES (3, 'UUID', 'string'),
   (3, 'IP Address', 'string'),
   (3, 'Model', 'string'),
   (3, 'Serial Number', 'number');
-- ===========================================================
-- Network Switch
-- ===========================================================
INSERT INTO AssetTypeFields (assetTypeId, name, type)
VALUES (4, 'Manufacturer', 'string'),
   (4, 'Model', 'string'),
   (4, 'Serial Number', 'string'),
   (4, 'Port Count', 'number'),
   (4, 'Management Address', 'string'),
   (4, 'Firmware Version', 'string'),
   (4, 'PoE Supported', 'boolean'),
   (4, 'Installation Date', 'date');
-- ===========================================================
-- PDU
-- ===========================================================
INSERT INTO AssetTypeFields (assetTypeId, name, type)
VALUES (5, 'Manufacturer', 'string'),
   (5, 'Model', 'string'),
   (5, 'Serial Number', 'string'),
   (5, 'Outlet Count', 'number'),
   (5, 'Voltage', 'number'),
   (5, 'Current Rating', 'number'),
   (5, 'Managed', 'boolean'),
   (5, 'Installation Date', 'date');
-- ===========================================================
-- Blanking Plate
-- ===========================================================
INSERT INTO AssetTypeFields (assetTypeId, name, type)
VALUES (6, 'Manufacturer', 'string'),
   (6, 'Size U', 'number'),
   (6, 'Material', 'string'),
   (6, 'Colour', 'string'),
   (6, 'Quantity', 'number');
-- ===========================================================
-- UPS
-- ===========================================================
INSERT INTO AssetTypeFields (assetTypeId, name, type)
VALUES (7, 'Manufacturer', 'string'),
   (7, 'Model', 'string'),
   (7, 'Serial Number', 'string'),
   (7, 'Capacity VA', 'number'),
   (7, 'Capacity Watts', 'number'),
   (7, 'Battery Count', 'number'),
   (7, 'Network Managed', 'boolean'),
   (7, 'Battery Replacement Date', 'date'),
   (7, 'Installation Date', 'date');
-- ===========================================================
-- RPS (Redundant Power Supply)
-- ===========================================================
INSERT INTO AssetTypeFields (assetTypeId, name, type)
VALUES (8, 'Manufacturer', 'string'),
   (8, 'Model', 'string'),
   (8, 'Serial Number', 'string'),
   (8, 'Wattage', 'number'),
   (8, 'Input Voltage', 'number'),
   (8, 'Hot Swappable', 'boolean'),
   (8, 'Installation Date', 'date');
-- ===========================================================
-- KVM
-- ===========================================================
INSERT INTO AssetTypeFields (assetTypeId, name, type)
VALUES (9, 'Manufacturer', 'string'),
   (9, 'Model', 'string'),
   (9, 'Serial Number', 'string'),
   (9, 'Port Count', 'number'),
   (9, 'IP Address', 'string'),
   (9, 'Remote Access', 'boolean'),
   (9, 'Rack Units', 'number'),
   (9, 'Installation Date', 'date');
-- ===========================================================
-- Brush Panel
-- ===========================================================
INSERT INTO AssetTypeFields (assetTypeId, name, type)
VALUES (10, 'Manufacturer', 'string'),
   (10, 'Size U', 'number'),
   (10, 'Material', 'string'),
   (10, 'Colour', 'string'),
   (10, 'Brush Type', 'string'),
   (10, 'Installation Date', 'date');
INSERT INTO StorageTypes (id, name)
VALUES (1, 'Rack');
INSERT INTO StorageTypeFields (storageTypeId, name, type)
VALUES (1, 'U Size', 'number');