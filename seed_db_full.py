import sqlite3
import json
from pathlib import Path

DB_PATH = Path("/llm/overcyber-reloaded-neon/data/overcyber.db")

conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row

# 1. Publicações (04 // KNOWLEDGE DATABASE)
publications_data = {
    "articles": [
        {
            "year": "2025",
            "title": "Metodologia para Detecção de Tráfego de Rede Malicioso Utilizando Vetorização e Aprendizagem de Máquina",
            "journal": "Lecture Notes in Networks and Systems (ISSN: 2367-3389)"
        },
        {
            "year": "2025",
            "title": "Proactive Management of Offensive Profiles: Detecting Trends in Cyberattacks on Institutions in Brazil Through the Analysis of Hacker Communities Using Complex Networks and Machine Learning Algorithms",
            "journal": "REVISTA ENIAC PESQUISA (ISSN: 2316-2341)"
        }
    ],
    "conferences": [
        {
            "year": "2024",
            "title": "Proactive Management of Offensive Profiles: Detecting Trends in Cyberattacks on Institutions in Brazil...",
            "conference": "XXI Encontro Nacional de Inteligência Artificial e Computacional (ENIAC 2024) — Belém/PA"
        }
    ],
    "patents": []
}

# 2. Experiência
experience_data = [
    {
        "title": "Militar de Carreira — Defesa Cibernética",
        "period": "2012-PRESENTE",
        "company": "Marinha do Brasil",
        "duties": [
            "Atuação na área de Defesa Cibernética com dedicação exclusiva",
            "Desenvolvimento de projetos estratégicos para as Forças Armadas",
            "Participação em exercícios nacionais e internacionais de Defesa Cibernética (Guardião Cibernético 7.0, CyberShield 2025, Exercício Ibero-Americano)",
            "Professor monitor na disciplina de Mineração de Dados Massivo no PPCA/UnB (2024)"
        ]
    },
    {
        "title": "Arquiteto de Soluções LLM e IA",
        "period": "2023-2024",
        "company": "VIAAPIA Informática",
        "duties": [
            "Desenvolvimento de arquitetura e solução de Chat com Processamento de Linguagem Natural (LLM)",
            "Criação de plataforma de comunicação integrando módulos de NLP, TTS/STT e armazenamento",
            "Arquitetura de microsserviços em contêineres Docker para escalabilidade"
        ]
    }
]

# 3. Habilidades
skills_data = {
    "coreSkills": [
        {"name": "Defesa Cibernética", "level": 92},
        {"name": "Segurança da Informação", "level": 90},
        {"name": "Linux/Unix", "level": 88},
        {"name": "Redes de Computadores", "level": 85}
    ],
    "advancedSkills": [
        {"name": "Inteligência Artificial / ML", "level": 78},
        {"name": "Ciência de Dados", "level": 75},
        {"name": "Docker / Microsserviços", "level": 72},
        {"name": "OSINT / Pentest", "level": 80}
    ],
    "technologies": [
        "Python", "Linux", "Docker", "Windows Server", 
        "Machine Learning", "LLM", "Redes", "Firewall",
        "Criptografia", "Análise de Dados", "R", "OSINT", "C/C++", "Rust"
    ],
    "awards": [
        "SANS FOR500 Windows Forensics Analysis — 2025",
        "Core NetWars Tournament 7 — SANS — 2022",
        "Guardião Cibernético 7.0 — Exército Brasileiro — 2025",
        "CEH v7 Certified — EC-Council — 2013",
        "Prêmio de melhor trabalho de Mestrado - UNB"
    ]
}

# 4. Atualizar tabela resume no SQLite
with conn:
    # Publications
    conn.execute(
        "INSERT INTO resume(section, data_json, updated_at) VALUES ('publications', ?, strftime('%Y-%m-%dT%H:%M:%fZ','now')) "
        "ON CONFLICT(section) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at",
        (json.dumps(publications_data),)
    )
    # Experience
    conn.execute(
        "INSERT INTO resume(section, data_json, updated_at) VALUES ('experience', ?, strftime('%Y-%m-%dT%H:%M:%fZ','now')) "
        "ON CONFLICT(section) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at",
        (json.dumps(experience_data),)
    )
    # Skills
    conn.execute(
        "INSERT INTO resume(section, data_json, updated_at) VALUES ('skills', ?, strftime('%Y-%m-%dT%H:%M:%fZ','now')) "
        "ON CONFLICT(section) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at",
        (json.dumps(skills_data),)
    )

# 5. Projetos (se tabela vazia, popular com os 3 projetos padrão)
cursor = conn.cursor()
cursor.execute("SELECT COUNT(*) as cnt FROM projects")
cnt = cursor.fetchone()["cnt"]
if cnt == 0:
    default_projects = [
        (
            "NeuraScan",
            "Advanced neural network-based vulnerability scanner with deep learning capabilities to identify zero-day exploits in web applications.",
            "Python, Machine Learning, Security",
            "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://github.com/overcyber/neurascan",
            "https://neurascan.io",
            342, 87,
            "# NeuraScan: Next-Gen Vulnerability Scanner\n\n## Introduction\nNeuraScan is a revolutionary neural network-based vulnerability scanner...",
            1
        ),
        (
            "CyberShield",
            "Enterprise-grade intrusion prevention system with real-time threat intelligence and automated response capabilities.",
            "Rust, Networking, Firewall",
            "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://github.com/overcyber/cybershield",
            "https://cybershield.dev",
            765, 134,
            "# CyberShield\n\nCyberShield is a next-generation intrusion prevention system...",
            2
        ),
        (
            "QuantumCrypt",
            "Post-quantum cryptographic library implementing advanced algorithms resistant to quantum computing attacks.",
            "C++, Cryptography, Quantum",
            "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            "https://github.com/overcyber/quantumcrypt",
            None,
            531, 97,
            "# QuantumCrypt\n\n## Quantum-Resistant Cryptographic Library...",
            3
        ),
    ]
    with conn:
        conn.executemany(
            "INSERT INTO projects(title, description, tags, image, github, live, stars, forks, readme, ord) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            default_projects
        )

conn.close()
print("BANCO DE DADOS ATUALIZADO COM SUCESSO: Publications, Experience, Skills, Projects sincronizados!")
