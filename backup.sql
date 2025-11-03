-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: oshikatu
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Current Database: `oshikatu`
--

CREATE DATABASE /*!32312 IF NOT EXISTS*/ `oshikatu` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `oshikatu`;

--
-- Table structure for table `memories`
--

DROP TABLE IF EXISTS `memories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `memories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `memory` text COLLATE utf8mb4_general_ci NOT NULL,
  `date` date NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `imageUrl` varchar(2083) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `category` varchar(30) COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `memories`
--

LOCK TABLES `memories` WRITE;
/*!40000 ALTER TABLE `memories` DISABLE KEYS */;
INSERT INTO `memories` VALUES (2,'ｆれｆ','ふぇｗｆ','2025-08-05','2025-08-02 15:10:29',NULL,NULL),(3,'ｆれｆ','ふぇｗｆ','2025-08-05','2025-08-02 15:11:16',NULL,NULL),(4,'ふぇｒｗｆ','ふぇｗｆ','2025-08-05','2025-08-02 15:11:37',NULL,NULL),(5,'テスト','テスト','2025-08-04','2025-08-02 15:26:31',NULL,NULL),(7,'estte','st4ewt','2025-08-05','2025-08-02 15:35:25',NULL,NULL),(20,'estte','stte','2025-08-07','2025-08-03 12:48:29',NULL,NULL),(22,'estt','t4wef','2025-08-08','2025-08-03 12:57:38',NULL,NULL),(23,'てｗふぇｗ','ふぇｗふぇｗｆ','2025-08-03','2025-08-03 13:14:48',NULL,NULL),(25,'イベント','イベントで楽しんだ','2025-08-07','2025-08-03 13:24:08',NULL,NULL),(26,'','','2025-08-04','2025-08-03 16:13:12',NULL,NULL),(31,'ｔｆれｇｆヴぇ','ふぇｗｆ','2025-08-09','2025-08-09 20:48:20',NULL,NULL),(32,'ふぇｗｆ','ふぇｗｆｗｆ','2025-08-09','2025-08-09 20:48:31',NULL,NULL),(33,'えｗｆ','ふぇｗｆｗ','2025-08-09','2025-08-09 20:49:27',NULL,NULL),(34,'ふぇｗｆ','ふぇｗｆ','2025-08-09','2025-08-09 20:49:36',NULL,NULL),(35,'ふぇｗｆ','ふぇｗｆ','2025-08-09','2025-08-09 20:49:59',NULL,NULL),(36,'ｔ４うぇｆｗ「','ふぇｗｆｗ','2025-08-03','2025-08-09 20:50:17',NULL,NULL),(37,'ふぇｗｆ','ふぇｗｆ','2025-08-03','2025-08-09 20:50:31',NULL,NULL),(38,'れｗふぇｆ','ふぇｒｗｆ','2025-08-03','2025-08-09 20:50:43',NULL,NULL),(39,'ｆｆｆｆ','うぇふぇｗｆｗ','2025-08-04','2025-08-09 20:58:56',NULL,NULL),(40,'ｒふぇｒｇｖｆれｗｖ','ｆせｗｆｗふぇｆ','2025-08-04','2025-08-09 21:01:20',NULL,NULL),(41,'ふぇｗふぇｒｗふぇｇｆｖ','ふぇｒｗｆヴぇｗｆヴぇｗｖ','2025-08-04','2025-08-09 21:02:20',NULL,NULL),(42,'ｇｖれｇふぇｇｆ','ｆ４３ｆｒ３ｆ','2025-08-04','2025-08-09 21:03:15',NULL,NULL),(43,'ふぇｗｆｗｆ','ふぇｗｆｗｆｆｃ','2025-08-06','2025-08-09 21:05:57',NULL,NULL),(44,'あああああああああああああ','ああああああああああああ','2025-08-03','2025-08-09 21:22:45',NULL,NULL),(45,'fewfwfwferwfrrrrrrrrrrrrrrrrrrrrrrrrrr','few','2025-08-06','2025-08-09 22:21:15',NULL,NULL),(46,'fewfwfwferwfrrrrrrrrrrrrrrrrrrrrrrrrrr','few','2025-08-06','2025-08-09 22:21:44',NULL,NULL),(47,'fewfwfwferwfrrrrrrrrrrrrrrrrrrrrrrrrrr','few','2025-08-06','2025-08-09 22:22:42',NULL,NULL),(49,'あああ','test','2025-08-12','2025-08-09 22:29:31',NULL,NULL),(50,'t4es','fewfwf','2025-07-30','2025-08-10 22:24:56',NULL,NULL),(51,'t4es','fewfwf','2025-07-30','2025-08-10 22:26:31',NULL,NULL),(52,'t4es','fewfwf','2025-07-30','2025-08-10 22:28:15',NULL,NULL),(53,'t4es','fewfwf','2025-07-30','2025-08-10 22:29:04',NULL,NULL),(54,'ｇｆｖれｇｖれ','ｖれふぇｗｆ','2025-08-06','2025-08-10 22:40:34',NULL,NULL),(55,'rampage野外フェス','友人とrampage野外フェスに参加した','2025-09-23','2025-09-23 18:19:26',NULL,NULL),(56,'rampageイベント','友人とrampageのイベントに参加した','2025-09-23','2025-09-23 19:13:03',NULL,NULL),(57,'rampage10周年ライブ','楽しかった','2025-09-16','2025-09-23 19:56:26',NULL,NULL),(71,'三代目ドームツアー','楽しかった','2025-10-07','2025-10-12 20:36:53',NULL,'live'),(73,'rampageアリーナツアー','初参戦！','2025-10-10','2025-10-12 22:41:47',NULL,'live'),(74,'itsuki birthday!!!','','2025-10-20','2025-10-14 23:00:06',NULL,'annivarsary'),(75,'ライブに向けて美容day','','2025-10-22','2025-10-18 14:14:57',NULL,'activity'),(77,'推し活友達とカフェ','','2025-10-09','2025-10-18 15:38:13',NULL,'communication'),(78,'三代目のグッズ','tribestore押しグッズゲット','2025-10-08','2025-10-18 15:51:22',NULL,'goods'),(79,'テスト','テスト','2025-10-06','2025-10-19 17:48:11',NULL,'goods'),(80,'test','test','2025-11-05','2025-11-01 19:25:02',NULL,'live');
/*!40000 ALTER TABLE `memories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `memory_images`
--

DROP TABLE IF EXISTS `memory_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `memory_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `memory_id` int NOT NULL,
  `image_path` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `uploaded_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `memory_id` (`memory_id`),
  CONSTRAINT `memory_images_ibfk_1` FOREIGN KEY (`memory_id`) REFERENCES `memories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=66 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `memory_images`
--

LOCK TABLES `memory_images` WRITE;
/*!40000 ALTER TABLE `memory_images` DISABLE KEYS */;
INSERT INTO `memory_images` VALUES (1,22,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1754193457710_%C3%A6%C2%9C%C2%AC%C3%A6%C2%84%C2%9F%C3%A6%C2%83%C2%B3.txt','2025-08-03 12:57:38'),(2,23,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1754194488636_%C3%A7%C2%94%C2%BB%C3%A9%C2%9D%C2%A2%C3%A8%C2%A6%C2%8F%C3%A5%C2%AE%C2%9A%C3%A3%C2%81%C2%AE%C3%A8%C2%A6%C2%B3%C3%A7%C2%82%C2%B9.txt','2025-08-03 13:14:48'),(4,25,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1754195048429_3a26fcfc-a7cd-4121-84b1-9a466d1f010c.txt','2025-08-03 13:24:08'),(10,39,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1754740736284_41312fe3-f04c-4ad1-a27c-ba33c63d8111.png','2025-08-09 20:58:56'),(11,40,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1754740880188_5f0ac7e8-b26f-4d5f-b710-6034c9555175.png','2025-08-09 21:01:20'),(12,41,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1754740940106_4eff6550-cf2d-4cf8-8294-6d1f80acbc56.png','2025-08-09 21:02:20'),(13,42,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1754740994978_e2367cdd-166a-4584-9228-7c602beaf44c.png','2025-08-09 21:03:15'),(14,43,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1754741156860_f9bbe311-28f9-4a3c-ace7-2116f3b1663a.png','2025-08-09 21:05:57'),(15,44,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1754742165036_65691161-0a74-4aa6-82a3-5a58cafe4988.png','2025-08-09 21:22:45'),(16,45,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1754745675344_91b82eb6-30a7-4c24-bb19-a1632ec7bad8.png','2025-08-09 22:21:15'),(17,46,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1754745704545_5d6e3ae6-b53f-40bb-b469-6773866c6124.jpg','2025-08-09 22:21:44'),(18,47,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1754745762236_5ba5b23f-1b89-4da0-911e-18376ac9e55d.jpg','2025-08-09 22:22:42'),(21,50,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1754832295716_6978e3af-f871-4682-b0fe-2110d7fc4252.png','2025-08-10 22:24:56'),(22,54,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1754833233702_fa12ef5b-f342-4616-afc0-d6ca4c518a58.png','2025-08-10 22:40:34'),(23,55,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1758619162301_8791f73a-fdd5-4ed7-a7e4-c46ba33bd8c5.jpg','2025-09-23 18:19:26'),(24,55,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1758619164140_b20afd22-8359-4ae9-85fa-ffd9f8f14546.jpg','2025-09-23 18:19:26'),(25,55,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1758619165178_0cc5b7c8-8d40-49e8-907a-93bc67e728dd.jpg','2025-09-23 18:19:26'),(28,57,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1758624984985_d5cd3d20-53f9-4485-a43a-33227851e670.jpg','2025-09-23 19:56:26'),(31,56,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1759656616219_763fc879-b250-4158-87a4-ce7c7bfdfa94.jpg','2025-10-05 18:30:24'),(32,56,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1759656619091_2a91219d-43bc-45b0-ae66-764c4fd9f3b5.jpg','2025-10-05 18:30:24'),(64,79,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1760863690134_dc248d32-7a71-4179-a9c4-a7fac82e5c0e.jpg','2025-10-19 17:48:11'),(65,79,'https://myoshikatu.s3.ap-northeast-1.amazonaws.com/1760863690847_b7561543-88b3-4ca9-98d4-1a3e9f8f8ae5.jpg','2025-10-19 17:48:11');
/*!40000 ALTER TABLE `memory_images` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-02 19:01:46
