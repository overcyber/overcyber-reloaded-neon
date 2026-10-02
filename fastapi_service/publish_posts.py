#!/usr/bin/env python3
"""
Script para publicação oficial das 3 postagens no Blog da Overcyber via API REST.
Lê os arquivos de rascunho em drafts/blog/, associa as imagens geradas e publica via POST /api/posts.
"""

import os
import re
import sys
import json
import requests
from pathlib import Path

BASE_URL = "https://overcyber.online"
API_TOKEN = "ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88"

DRAFTS = [
    {
        "file": "drafts/blog/2026-10-02-finetuning-lora-qlora-rag-quando-usar.md",
        "image": "/blog/finetuning-lora-qlora-rag.jpg",
        "slug": "finetuning-lora-qlora-rag-quando-usar"
    },
    {
        "file": "drafts/blog/2026-10-02-jev-e-laya-modelos-de-decisao.md",
        "image": "/blog/jev-laya-decision-models.jpg",
        "slug": "jev-laya-modelos-de-decisao-system-one"
    },
    {
        "file": "drafts/blog/2026-10-02-oito-arquiteturas-de-rag.md",
        "image": "/blog/oito-arquiteturas-rag.jpg",
        "slug": "tipos-de-rag-vanilla-hybrid-graphrag-agentic-self-rag-crag-raptor-multimodal"
    }
]

def parse_frontmatter(content: str):
    frontmatter = {}
    body = content
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            fm_text = parts[1]
            body = parts[2].strip()
            # Simple YAML-like parser for common keys
            for line in fm_text.strip().split("\n"):
                line = line.strip()
                if ":" in line and not line.startswith("-"):
                    k, v = line.split(":", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    frontmatter[k] = v
    return frontmatter, body

def publish_all():
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }

    published_posts = []

    for item in DRAFTS:
        fpath = Path(item["file"])
        if not fpath.exists():
            print(f"ERRO: Arquivo não encontrado: {fpath}")
            sys.exit(1)

        raw_text = fpath.read_text(encoding="utf-8")
        fm, body = parse_frontmatter(raw_text)

        title = fm.get("title", fpath.stem)
        slug = item["slug"]
        excerpt = fm.get("excerpt", "")
        image_url = item["image"]

        payload = {
            "title": title,
            "slug": slug,
            "excerpt": excerpt,
            "content": body,
            "image": image_url,
            "status": "published"
        }

        print(f"\nPublicando post via API: '{title}'...")
        print(f"Slug: {slug}")
        print(f"Imagem: {image_url}")

        # Verifica se o post já existe (para atualizar se já existir ou criar)
        check_res = requests.get(f"{BASE_URL}/api/posts/{slug}")
        if check_res.status_code == 200:
            existing = check_res.json()
            post_id = existing.get("id")
            print(f"Post existente encontrado (ID: {post_id}). Atualizando via PUT /api/posts/{post_id}...")
            r = requests.put(f"{BASE_URL}/api/posts/{post_id}", headers=headers, json=payload)
        else:
            print(f"Criando novo post via POST /api/posts...")
            r = requests.post(f"{BASE_URL}/api/posts", headers=headers, json=payload)

        if r.status_code in (200, 201):
            res_data = r.json()
            print(f"[OK] Post publicado com sucesso! ID: {res_data.get('id')}")
            published_posts.append(res_data)
        else:
            print(f"[ERRO] Falha ao publicar post. Status: {r.status_code}")
            print(r.text)
            sys.exit(1)

    print("\n============================================================")
    print(f" TOTAL DE POSTS PUBLICADOS VIA API: {len(published_posts)}")
    print("============================================================\n")

    # Validar no endpoint público
    r_public = requests.get(f"{BASE_URL}/api/posts")
    if r_public.status_code == 200:
        public_posts = r_public.json()
        print(f"Endpoint público /api/posts retornou {len(public_posts)} posts publicados.")
        for p in public_posts:
            print(f" - {p.get('title')} ({p.get('slug')})")

if __name__ == "__main__":
    publish_all()
