-- ===========================================================
-- Redfish Database Schema
-- MySQL 8+
-- ===========================================================
DROP DATABASE IF EXISTS redfish;

CREATE DATABASE redfish CHARACTER
SET
   utf8mb4 COLLATE utf8mb4_unicode_ci;

USE redfish;

-- ===========================================================
-- Assets
-- ===========================================================
CREATE TABLE
   Assets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      notes TEXT NULL,
      uTop INT NOT NULL DEFAULT 0,
      uBottom INT NOT NULL DEFAULT 0,
      uSize INT NOT NULL DEFAULT 1
   );

-- ===========================================================
-- Data
-- ===========================================================
CREATE TABLE
   Data (id INT AUTO_INCREMENT PRIMARY KEY);

-- ===========================================================
-- DataFields
-- ===========================================================
CREATE TABLE
   DataFields (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dataId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      identifier VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL,
      value VARCHAR(511) NULL,
      deletable BOOLEAN NOT NULL DEFAULT FALSE,
      CONSTRAINT uq_identifier_dataid UNIQUE (dataId, identifier),
      CONSTRAINT fk_datafield_data FOREIGN KEY (dataId) REFERENCES Data (id) ON DELETE CASCADE
   );

-- ===========================================================
-- Domains
-- ===========================================================
CREATE TABLE
   Domains (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      dataId INT NOT NULL,
      CONSTRAINT fk_domain_data FOREIGN KEY (dataId) REFERENCES Data (id)
   );

-- ===========================================================
-- Genders
-- ===========================================================
CREATE TABLE
   PrimaryGenders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      domainId INT NOT NULL,
      nodeCount INT NOT NULL,
      ipMask VARCHAR(255) NOT NULL,
      nameMask VARCHAR(255) NOT NULL,
      name VARCHAR(255) NOT NULL,
      dataId int NOT NULL,
      genderIndex INT NOT NULL,
      CONSTRAINT uq_name_domainid UNIQUE (name, domainId),
      CONSTRAINT fk_primarygender_data FOREIGN KEY (dataId) REFERENCES Data (id),
      CONSTRAINT fk_primarygender_domain FOREIGN KEY (domainId) REFERENCES Domains (id)
   );

-- ===========================================================
-- SubGenders
-- ===========================================================
CREATE TABLE
   SubGenders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      domainId INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      dataId int NOT NULL,
      CONSTRAINT uq_name_domainid UNIQUE (name, domainId),
      CONSTRAINT fk_subgender_data FOREIGN KEY (dataId) REFERENCES Data (id),
      CONSTRAINT fk_subgender_domain FOREIGN KEY (domainId) REFERENCES Domains (id)
   );

-- ===========================================================
-- GenderHierarchy
-- ===========================================================
CREATE TABLE
   GenderHierarchy (
      primaryGenderId INT NOT NULL,
      subgenderId INT NOT NULL,
      priority INT NOT NULL DEFAULT 0,
      PRIMARY KEY (primaryGenderId, subgenderId),
      UNIQUE (primaryGenderId, priority),
      CONSTRAINT fk_primarygender_heirarchy FOREIGN KEY (primaryGenderId) REFERENCES PrimaryGenders (id) ON DELETE CASCADE,
      CONSTRAINT fk_subgender_heirarchy FOREIGN KEY (subgenderId) REFERENCES SubGenders (id) ON DELETE CASCADE
   );

-- ===========================================================
-- Nodes
-- ===========================================================
CREATE TABLE
   Nodes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      primaryGenderId INT NOT NULL,
      name VARCHAR(255) NULL,
      dataId int NOT NULL,
      nodeIndex INT NOT NULL,
      CONSTRAINT fk_nodes_data FOREIGN KEY (dataId) REFERENCES Data (id),
      CONSTRAINT fk_nodes_gender FOREIGN KEY (primaryGenderId) REFERENCES PrimaryGenders (id)
   );

-- ===========================================================
-- AssetNode
-- ===========================================================
CREATE TABLE
   AssetNode (
      nodeId INT NOT NULL,
      assetId INT NOT NULL,
      PRIMARY KEY (nodeId, assetId),
      CONSTRAINT fk_node_assetnode FOREIGN KEY (nodeId) REFERENCES Nodes (id) ON DELETE CASCADE,
      CONSTRAINT fk_asset_assetnode FOREIGN KEY (assetId) REFERENCES Assets (id) ON DELETE CASCADE
   );