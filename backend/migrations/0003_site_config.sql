-- Configurações do site (key/value JSON). Usado para visibilidade de seções.
CREATE TABLE IF NOT EXISTS site_config (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT OR IGNORE INTO site_config(key, value) VALUES (
    'sections',
    json('{"profile":true,"education":true,"experience":true,"publications":true,"skills":true,"projects":true,"blog":true,"contact":true}')
);
