-- 準備TODOテーブル memory_tasks
-- 稼働中DBへ手動で1回適用する（追加DDLなのでデータは消えない）:
--   ローカル(ホスト)MySQL: mysql -u root -p oshikatu < db/create_memory_tasks.sql
--   Docker MySQL          : docker exec -i oshikatu_db mysql -u root -p oshikatu < db/create_memory_tasks.sql
-- 1タスク=1行の縦持ち。memory 削除時は ON DELETE CASCADE で連動削除する。

CREATE TABLE IF NOT EXISTS `memory_tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `memory_id` int NOT NULL,
  `task_name` varchar(255) NOT NULL,
  `is_completed` tinyint(1) NOT NULL DEFAULT 0,
  `due_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `memory_id` (`memory_id`),
  CONSTRAINT `memory_tasks_ibfk_1`
    FOREIGN KEY (`memory_id`) REFERENCES `memories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
