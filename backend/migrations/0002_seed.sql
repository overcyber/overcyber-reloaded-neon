-- Seeds rodam apenas se a tabela alvo estiver vazia.
INSERT OR IGNORE INTO about(id, data_json) VALUES (1, json('{
  "name": "Claudio Henrique Marques de Oliveira",
  "title": "Militar - Marinha do Brasil | Especialista em Defesa Cibernética | Mestrando em Computação Aplicada (UnB)",
  "bio": "Profissional com sólida experiência na área de Defesa, com ênfase em Defesa Cibernética, atuando na área de segurança da informação há 19 anos, desenvolvendo projetos para as Forças Armadas e projetos pessoais. Nos últimos anos, tenho direcionado minha expertise para a área de Ciência de Dados e Inteligência Artificial aplicada à Defesa, combinando conhecimentos tradicionais de segurança cibernética com técnicas avançadas de análise de dados e machine learning.",
  "email": "unixsolution@gmail.com",
  "location": "Brasília, DF, Brasil",
  "lattes": "https://lattes.cnpq.br/2915812289846388",
  "profileImage": "https://avatars.githubusercontent.com/u/583231",
  "researchFocus": ["Defesa Cibernética","Guerra Cibernética","Segurança da Informação","Ciência de Dados","Inteligência Artificial","Machine Learning"]
}'));

INSERT OR IGNORE INTO resume(section, data_json) VALUES
  ('education',    json('[]')),
  ('experience',   json('[]')),
  ('publications', json('{"articles":[],"conferences":[],"patents":[]}')),
  ('skills',       json('{"coreSkills":[],"advancedSkills":[],"technologies":[],"awards":[]}'));
