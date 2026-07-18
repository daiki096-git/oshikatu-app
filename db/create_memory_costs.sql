-- 費用カテゴリ別明細テーブル memory_costs
-- 稼働中DBへ手動で1回適用する（追加DDLなのでデータは消えない）:
--   ローカル(ホスト)MySQL: mysql -u root -p oshikatu < db/create_memory_costs.sql
--   Docker MySQL          : docker exec -i oshikatu_db mysql -u root -p oshikatu < db/create_memory_costs.sql
-- 1費用=1行の縦持ち。unique(memory_id, category) で「同一カテゴリ1件のみ」をDBで担保する。

CREATE TABLE IF NOT EXISTS `memory_costs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `memory_id` int NOT NULL,
  `category` varchar(32) NOT NULL,
  `amount` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_memory_category` (`memory_id`, `category`),
  KEY `memory_id` (`memory_id`),
  CONSTRAINT `memory_costs_ibfk_1`
    FOREIGN KEY (`memory_id`) REFERENCES `memories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
