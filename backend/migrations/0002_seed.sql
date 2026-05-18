-- Seeds rodam apenas se a tabela alvo estiver vazia.
INSERT OR IGNORE INTO about(id, data_json) VALUES (1, json('{
  "name": "Dr. Melquizedequi Cabral dos Santos",
  "title": "Professor Associado - Universidade Federal do Piauí",
  "bio": "Pesquisador e especialista em cibersegurança com foco em técnicas avançadas de proteção de dados.",
  "email": "secure@cyberdomain.net",
  "location": "São Paulo, Brasil",
  "lattes": "https://lattes.cnpq.br/2915812289846388",
  "profileImage": "https://avatars.githubusercontent.com/u/583231",
  "researchFocus": ["Cibersegurança","Machine Learning","Análise de Vulnerabilidades"]
}'));

INSERT OR IGNORE INTO resume(section, data_json) VALUES
  ('education',    json('[]')),
  ('experience',   json('[]')),
  ('publications', json('{"articles":[],"conferences":[],"patents":[]}')),
  ('skills',       json('{"coreSkills":[],"advancedSkills":[],"technologies":[],"awards":[]}'));
