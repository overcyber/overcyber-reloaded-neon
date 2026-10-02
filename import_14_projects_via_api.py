#!/usr/bin/env python3
"""
Script para exclusão segura dos projetos antigos e criação dos 14 novos projetos
via API do Overcyber (/gateway/api/projects).
"""

import json
import os
import sys
import urllib.request
import urllib.error

TOKEN = os.environ.get("OVERCYBER_API_TOKEN", "ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88")
BASE_URL = os.environ.get("OVERCYBER_API_URL", "https://overcyber.online/gateway")

PNG_MAPPING = {
    "adversarial-cybersec": "/projects/adversarial.png",
    "neoalice-superbrain": "/projects/neoalice_superbrain.png",
    "qsim": "/projects/qsim.png",
    "crypto-monitor-platform": "/projects/cryptomonitorplatform.png",
    "docling-qdrant-rag-harness": "/projects/doclingqdranharness.png",
    "oscen": "/projects/oscen.png",
    "red-mppo-evaluation": "/projects/red_mppo_evaluationharness.png",
    "ruadan": "/projects/ruadan.png",
    "aegis-architecture": "/projects/aegis.png",
    "gemini-superbrain-memory": "/projects/gemini-superbrain-memory.png",
    "artemis-netflow": "/projects/artemis.png",
    "minicurso-multiagents": "/projects/nexus-minicurso-mult-agents.png",
    "cyberguardian": "/projects/cyberguardian.png",
    "unknown-so": "/projects/unknown-so.png",
}

def api_request(method: str, path: str, data: dict = None):
    url = f"{BASE_URL}{path}"
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json",
        "User-Agent": "Overcyber-Project-Importer/1.0"
    }
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode("utf-8")
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8", errors="replace")
        return e.code, {"error": err_body}
    except Exception as e:
        return 0, {"error": str(e)}

def main():
    print("=" * 60)
    print("OVERCYBER - IMPORTAÇÃO DOS 14 PROJETOS VIA API")
    print(f"Target Gateway: {BASE_URL}")
    print("=" * 60)

    # 1. Carregar arquivos de origem
    site_file = "overcyber-projects-documentation/projects-overcyber-site-ready-ptbr.json"
    manifest_file = "overcyber-projects-documentation/projects-audit-manifest.json"

    if not os.path.exists(site_file) or not os.path.exists(manifest_file):
        print(f"ERRO: Arquivos de documentação não encontrados em {site_file} / {manifest_file}")
        sys.exit(1)

    with open(site_file, "r", encoding="utf-8") as f:
        site_projects = json.load(f)

    with open(manifest_file, "r", encoding="utf-8") as f:
        manifest_projects = json.load(f)

    manifest_by_title = {p["title"].strip(): p for p in manifest_projects}

    # 2. Listar projetos existentes na API
    status_code, existing = api_request("GET", "/api/projects")
    if status_code != 200:
        print(f"ERRO ao listar projetos na API: HTTP {status_code} - {existing}")
        sys.exit(1)

    print(f"\n[+] Projetos atualmente na API ({len(existing)}):")
    for p in existing:
        print(f"    - ID: {p.get('id')} | Slug: {p.get('slug')} | Título: {p.get('title')}")

    # 3. Remover projetos antigos via API
    print(f"\n[+] Removendo projetos existentes via DELETE...")
    for p in existing:
        pid = p["id"]
        del_status, del_resp = api_request("DELETE", f"/api/projects/{pid}")
        if del_status == 200:
            print(f"    [DELETED] ID {pid}: {p.get('title')}")
        else:
            print(f"    [FALHA] Não foi possível deletar ID {pid}: HTTP {del_status} - {del_resp}")

    # 4. Criar os 14 novos projetos
    print(f"\n[+] Criando os 14 novos projetos com imagens e metadados...")
    created_projects = []
    for idx, sp in enumerate(site_projects, 1):
        title = sp["title"].strip()
        mp = manifest_by_title.get(title, {})
        slug = mp.get("slug", title.lower().replace(" ", "-"))
        png_img = PNG_MAPPING.get(slug, sp.get("image"))
        status_desc = mp.get("status", "")
        visibility = mp.get("visibility", "public")
        source_repos = mp.get("source_repositories", [])

        payload = {
            "slug": slug,
            "title": title,
            "description": sp.get("description", ""),
            "tags": sp.get("tags", []),
            "image": png_img,
            "github": sp.get("github", ""),
            "live": sp.get("live", ""),
            "stars": sp.get("stars", 0),
            "forks": sp.get("forks", 0),
            "visibility": visibility,
            "status": status_desc,
            "source_repos": source_repos,
            "readme": sp.get("readme", ""),
            "ord": sp.get("ord", idx)
        }

        post_status, post_resp = api_request("POST", "/api/projects", payload)
        if post_status == 201:
            created_projects.append(post_resp)
            print(f"    [CREATED {idx}/14] ID {post_resp.get('id')}: [{slug}] {title[:40]}... (Image: {png_img})")
        else:
            print(f"    [ERRO {idx}/14] Falha ao criar {slug}: HTTP {post_status} - {post_resp}")

    # 5. Validação final
    print(f"\n[+] Verificando listagem final na API...")
    val_status, val_list = api_request("GET", "/api/projects")
    if val_status == 200 and len(val_list) == len(site_projects):
        print(f"SUCESSO! Todos os {len(val_list)} projetos foram criados e estão acessíveis.")
        for p in val_list:
            print(f"  #{p.get('ord')} [ID {p.get('id')}] [{p.get('slug')}] {p.get('title')[:35]}... -> {p.get('image')}")
    else:
        print(f"ATENÇÃO: Quantidade retornada ({len(val_list)}) difere do esperado ({len(site_projects)}).")

if __name__ == "__main__":
    main()
