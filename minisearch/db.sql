CREATE TABLE `documents` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `site_id` int(11) NOT NULL,
  `signature` varchar(64) NOT NULL,
  `content` text NOT NULL,
  PRIMARY KEY (`id`)
)ENGINE=MyISAM DEFAULT CHARSET=utf8;
create index documents_index on documents (site_id,signature); 
CREATE TABLE `sph_counter` (
  `counter_id` int(11) NOT NULL,
  `max_doc_id` int(11) NOT NULL,
  PRIMARY KEY (`counter_id`)
)ENGINE=MyISAM DEFAULT CHARSET=utf8;
