#!/usr/bin/env python3
"""
Script de validação abrangente de todos os endpoints da API Overcyber em produção.
Executa testes reais de ponta a ponta:
- Autenticação e Sessão (/api/auth/login, /api/auth/me)
- Posts e Blog (/api/posts)
- Projetos e READMEs (/api/projects)
- Seções (/api/sections)
- Mensagens de Contato / Inbox (/api/contact, /api/contact/messages)
- Ciclo Completo de Comentários (/api/comments/counts, pending, approved, rejected, spam, delete)
- Validação Estrita de Isolamento de Comentários Públicos
"""

import sys
import json
import requests

BASE_URL = "https://overcyber.online"
ADMIN_USER = "admin"
ADMIN_PASS = "Tempo#2026SenhaForte2"
BEARER_TOKEN = "ovc_c5r_jMvyDuBRE48_kaFo1WtqeDiSZ14Mjy3RXFhNe88"

passed_tests = 0
failed_tests = 0

def log_test(name: str, passed: bool, detail: str = ""):
    global passed_tests, failed_tests
    if passed:
        passed_tests += 1
        print(f"  [PASS] {name} {f'({detail})' if detail else ''}")
    else:
        failed_tests += 1
        print(f"  [FAIL] {name} - {detail}")

def run_tests():
    print(f"\n============================================================")
    print(f" INICIANDO TESTES COMPLETOS DE API EM {BASE_URL}")
    print(f"============================================================\n")

    session = requests.Session()
    headers_bearer = {"Authorization": f"Bearer {BEARER_TOKEN}"}

    # 1. Root API
    try:
        r = session.get(f"{BASE_URL}/api/", headers=headers_bearer, timeout=10)
        log_test("GET /api/ (Root)", r.status_code == 200, f"Status: {r.status_code}")
    except Exception as e:
        log_test("GET /api/ (Root)", False, str(e))

    # 2. Login de Admin (Sessão sid + CSRF)
    sid = None
    csrf = None
    try:
        r = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": ADMIN_USER, "password": ADMIN_PASS},
            timeout=10
        )
        if r.status_code == 200:
            data = r.json()
            sid = session.cookies.get("sid") or r.cookies.get("sid")
            csrf = data.get("csrf")
            log_test("POST /api/auth/login", True, f"User ID: {data.get('user', {}).get('id')}")
        else:
            log_test("POST /api/auth/login", False, f"Status {r.status_code}: {r.text}")
    except Exception as e:
        log_test("POST /api/auth/login", False, str(e))

    # 3. GET /api/auth/me (Verifica sessão ativa)
    try:
        r = session.get(f"{BASE_URL}/api/auth/me", timeout=10)
        log_test("GET /api/auth/me", r.status_code == 200 and r.json().get("username") == "admin", f"User: {r.json().get('username')}")
    except Exception as e:
        log_test("GET /api/auth/me", False, str(e))

    # 4. Public Posts
    post_slug = None
    try:
        r = session.get(f"{BASE_URL}/api/posts", timeout=10)
        posts = r.json()
        if r.status_code == 200 and isinstance(posts, list) and len(posts) > 0:
            post_slug = posts[0].get("slug")
            log_test("GET /api/posts", True, f"{len(posts)} posts públicos encontrados")
        else:
            log_test("GET /api/posts", False, f"Retornou {r.status_code}")
    except Exception as e:
        log_test("GET /api/posts", False, str(e))

    # 5. Public Post Details
    if post_slug:
        try:
            r = session.get(f"{BASE_URL}/api/posts/{post_slug}", timeout=10)
            log_test(f"GET /api/posts/{post_slug}", r.status_code == 200, f"Título: {r.json().get('title')[:30]}...")
        except Exception as e:
            log_test(f"GET /api/posts/{post_slug}", False, str(e))

    # 6. Public Projects
    project_id = None
    project_slug = None
    try:
        r = session.get(f"{BASE_URL}/api/projects", timeout=10)
        projects = r.json()
        if r.status_code == 200 and isinstance(projects, list) and len(projects) == 14:
            project_id = projects[0].get("id")
            project_slug = projects[0].get("slug")
            log_test("GET /api/projects", True, f"14 projetos carregados perfeitamente")
        else:
            log_test("GET /api/projects", False, f"Total: {len(projects) if isinstance(projects, list) else r.status_code}")
    except Exception as e:
        log_test("GET /api/projects", False, str(e))

    # 7. Project Details & Readme
    if project_slug:
        try:
            r = session.get(f"{BASE_URL}/api/projects/{project_slug}", timeout=10)
            log_test(f"GET /api/projects/{project_slug}", r.status_code == 200, f"Projeto: {r.json().get('title')}")
            r_readme = session.get(f"{BASE_URL}/api/projects/{project_slug}/readme", timeout=10)
            log_test(f"GET /api/projects/{project_slug}/readme", r_readme.status_code == 200, f"Readme len: {len(r_readme.json().get('readme', ''))}")
        except Exception as e:
            log_test(f"GET /api/projects/{project_slug}", False, str(e))

    # 8. Sections
    try:
        r = session.get(f"{BASE_URL}/api/sections", timeout=10)
        log_test("GET /api/sections", r.status_code == 200, f"Seções: {list(r.json().keys())}")
    except Exception as e:
        log_test("GET /api/sections", False, str(e))

    # 9. Contact Form & Inbox
    msg_id = None
    try:
        r = session.post(
            f"{BASE_URL}/api/contact",
            json={
                "name": "Audit Bot",
                "email": "audit@overcyber.online",
                "subject": "Teste de Auditoria",
                "body": "Mensagem de verificação automática do endpoint de contato."
            },
            timeout=10
        )
        log_test("POST /api/contact", r.status_code in (200, 201), f"Status {r.status_code}")

        # List contact messages as admin
        r_list = session.get(f"{BASE_URL}/api/contact/messages", timeout=10)
        msgs = r_list.json()
        if r_list.status_code == 200 and isinstance(msgs, list):
            found = [m for m in msgs if m.get("email") == "audit@overcyber.online"]
            if found:
                msg_id = found[0].get("id")
                log_test("GET /api/contact/messages", True, f"Mensagem encontrada ID: {msg_id}")
            else:
                log_test("GET /api/contact/messages", True, f"{len(msgs)} mensagens listadas")
        else:
            log_test("GET /api/contact/messages", False, f"Status: {r_list.status_code}")

        if msg_id:
            # Mark read
            r_read = session.post(f"{BASE_URL}/api/contact/messages/{msg_id}/read", timeout=10)
            log_test("POST /api/contact/messages/{id}/read", r_read.status_code == 200, "Marcada como lida")
            # Delete message
            r_del = session.delete(f"{BASE_URL}/api/contact/messages/{msg_id}", timeout=10)
            log_test("DELETE /api/contact/messages/{id}", r_del.status_code == 200, "Mensagem excluída")
    except Exception as e:
        log_test("Contact/Inbox Test", False, str(e))

    # 10. CICLO COMPLETO DE COMENTÁRIOS: Counts, Pending, Approved, Rejected, Spam
    print("\n--- Verificando Ciclo Completo de Moderação de Comentários ---")
    try:
        # Contadores iniciais
        r_counts = session.get(f"{BASE_URL}/api/comments/counts", timeout=10)
        if r_counts.status_code == 200:
            c_init = r_counts.json()
            log_test("GET /api/comments/counts", True, f"Counts: {c_init}")
        else:
            log_test("GET /api/comments/counts", False, f"Status {r_counts.status_code}")
            c_init = {}

        # Listagem por filtros
        for st in ["all", "pending", "approved", "rejected", "spam"]:
            r_st = session.get(f"{BASE_URL}/api/comments?status={st}", timeout=10)
            log_test(f"GET /api/comments?status={st}", r_st.status_code == 200, f"{len(r_st.json())} itens")

        # Criar comentário de teste
        test_post = post_slug or "welcome"
        r_comm = session.post(
            f"{BASE_URL}/api/posts/{test_post}/comments",
            json={
                "author_name": "Audit Commenter",
                "body": "Comentário de teste para validação rigorosa de ciclo de status."
            },
            timeout=10
        )
        comm_data = r_comm.json()
        comm_id = comm_data.get("id")
        log_test("POST /api/posts/{slug}/comments (Criação)", r_comm.status_code in (200, 201) and comm_data.get("status") == "pending", f"ID: {comm_id}, Status: {comm_data.get('status')}")

        if comm_id:
            # 1. Comentário acabou de ser criado -> status = 'pending'
            # Validação no endpoint público do post: NÃO PODE APARECER
            r_pub = requests.get(f"{BASE_URL}/api/posts/{test_post}/comments", timeout=10)
            pub_ids = [c.get("id") for c in r_pub.json()]
            log_test("Isolamento Público: PENDENTE NÃO aparece no Blog público", comm_id not in pub_ids, f"Presente? {comm_id in pub_ids}")

            # 2. Aprovar comentário -> status = 'approved'
            r_app = session.post(f"{BASE_URL}/api/comments/{comm_id}/approve", timeout=10)
            log_test("POST /api/comments/{id}/approve", r_app.status_code == 200 and r_app.json().get("status") == "approved", "Aprovado")
            
            # Validação no endpoint público do post: DEVE APARECER
            r_pub = requests.get(f"{BASE_URL}/api/posts/{test_post}/comments", timeout=10)
            pub_ids = [c.get("id") for c in r_pub.json()]
            log_test("Isolamento Público: APROVADO APARECE no Blog público", comm_id in pub_ids, f"Presente? {comm_id in pub_ids}")

            # 3. Rejeitar comentário -> status = 'rejected'
            r_rej = session.post(f"{BASE_URL}/api/comments/{comm_id}/reject", timeout=10)
            log_test("POST /api/comments/{id}/reject", r_rej.status_code == 200 and r_rej.json().get("status") == "rejected", "Rejeitado")

            # Validação no endpoint público do post: NÃO PODE APARECER
            r_pub = requests.get(f"{BASE_URL}/api/posts/{test_post}/comments", timeout=10)
            pub_ids = [c.get("id") for c in r_pub.json()]
            log_test("Isolamento Público: REJEITADO NÃO aparece no Blog público", comm_id not in pub_ids, f"Presente? {comm_id in pub_ids}")

            # 4. Marcar como SPAM -> status = 'spam'
            r_sp = session.post(f"{BASE_URL}/api/comments/{comm_id}/spam", timeout=10)
            log_test("POST /api/comments/{id}/spam", r_sp.status_code == 200 and r_sp.json().get("status") == "spam", "Spam")

            # Validação no endpoint público do post: NÃO PODE APARECER
            r_pub = requests.get(f"{BASE_URL}/api/posts/{test_post}/comments", timeout=10)
            pub_ids = [c.get("id") for c in r_pub.json()]
            log_test("Isolamento Público: SPAM NÃO aparece no Blog público", comm_id not in pub_ids, f"Presente? {comm_id in pub_ids}")

            # 5. Voltar para Pendente -> status = 'pending'
            r_pend = session.post(f"{BASE_URL}/api/comments/{comm_id}/pending", timeout=10)
            log_test("POST /api/comments/{id}/pending", r_pend.status_code == 200 and r_pend.json().get("status") == "pending", "Voltou a Pendente")

            # Validação no endpoint público do post: NÃO PODE APARECER
            r_pub = requests.get(f"{BASE_URL}/api/posts/{test_post}/comments", timeout=10)
            pub_ids = [c.get("id") for c in r_pub.json()]
            log_test("Isolamento Público: PENDENTE restaurado NÃO aparece no Blog", comm_id not in pub_ids, f"Presente? {comm_id in pub_ids}")

            # 6. Atualização Arbitrária via PUT /api/comments/{id}/status
            r_put_status = session.put(f"{BASE_URL}/api/comments/{comm_id}/status", json={"status": "approved"}, timeout=10)
            log_test("PUT /api/comments/{id}/status", r_put_status.status_code == 200 and r_put_status.json().get("status") == "approved", "Status alterado via PUT")

            # 7. Excluir comentário definitivamente
            r_del_comm = session.delete(f"{BASE_URL}/api/comments/{comm_id}", timeout=10)
            log_test("DELETE /api/comments/{id}", r_del_comm.status_code == 200, "Comentário excluído")

            # Verificar contadores finais
            r_final_counts = session.get(f"{BASE_URL}/api/comments/counts", timeout=10)
            log_test("GET /api/comments/counts (Final)", r_final_counts.status_code == 200, f"Final: {r_final_counts.json()}")

    except Exception as e:
        log_test("Ciclo de Comentários", False, str(e))

    # 11. Blog Post CRUD Administrativo
    print("\n--- Verificando CRUD de Blog Posts Administrativo ---")
    test_created_post_id = None
    try:
        r_post_create = session.post(
            f"{BASE_URL}/api/posts",
            json={
                "title": "Post de Auditoria Temporário",
                "slug": "post-auditoria-temp",
                "excerpt": "Resumo do post de auditoria",
                "content": "# Conteúdo do post de teste\n\nEste post será removido após validação.",
                "status": "draft"
            },
            timeout=10
        )
        if r_post_create.status_code in (200, 201):
            created_post = r_post_create.json()
            test_created_post_id = created_post.get("id")
            log_test("POST /api/posts (Criação de Post)", True, f"ID: {test_created_post_id}")
        else:
            log_test("POST /api/posts (Criação de Post)", False, f"Status: {r_post_create.status_code}")

        if test_created_post_id:
            # Update post
            r_up = session.put(
                f"{BASE_URL}/api/posts/{test_created_post_id}",
                json={"title": "Post de Auditoria Temporário (Atualizado)"},
                timeout=10
            )
            log_test("PUT /api/posts/{id} (Atualização)", r_up.status_code == 200, "Atualizado")

            # Delete post
            r_del = session.delete(f"{BASE_URL}/api/posts/{test_created_post_id}", timeout=10)
            log_test("DELETE /api/posts/{id} (Exclusão)", r_del.status_code == 200, "Excluído")
    except Exception as e:
        log_test("CRUD Posts", False, str(e))

    # 12. CRUD de Projetos Administrativo
    print("\n--- Verificando CRUD de Projetos Administrativo ---")
    test_proj_id = None
    try:
        r_proj_create = session.post(
            f"{BASE_URL}/api/projects",
            json={
                "title": "Projeto Temporário de Auditoria",
                "slug": "projeto-temp-auditoria",
                "description": "Descrição de teste para auditoria",
                "tags": ["Audit", "FastAPI"],
                "image": "/projects/default.png",
                "github": "https://github.com/overcyber/audit",
                "visibility": "unlisted"
            },
            timeout=10
        )
        if r_proj_create.status_code in (200, 201):
            created_proj = r_proj_create.json()
            test_proj_id = created_proj.get("id")
            log_test("POST /api/projects (Criação)", True, f"ID: {test_proj_id}")
        else:
            log_test("POST /api/projects (Criação)", False, f"Status: {r_proj_create.status_code}")

        if test_proj_id:
            # Update README
            r_readme_up = session.put(
                f"{BASE_URL}/api/projects/{test_proj_id}/readme",
                json={"readme": "# Readme de Teste Atualizado"},
                timeout=10
            )
            log_test("PUT /api/projects/{id}/readme", r_readme_up.status_code == 200, "README atualizado")

            # Delete Project
            r_proj_del = session.delete(f"{BASE_URL}/api/projects/{test_proj_id}", timeout=10)
            log_test("DELETE /api/projects/{id}", r_proj_del.status_code == 200, "Projeto temporário excluído")
    except Exception as e:
        log_test("CRUD Projetos", False, str(e))

    # 13. Teste do Endpoint de Migração (localStorage import)
    print("\n--- Verificando Endpoint de Migração (/api/migrate/import) ---")
    try:
        r_mig = session.post(
            f"{BASE_URL}/api/migrate/import",
            json={
                "about": None,
                "resume": {},
                "projects": [],
                "posts": []
            },
            timeout=10
        )
        log_test("POST /api/migrate/import", r_mig.status_code == 200 and "counts" in r_mig.json(), f"Retorno: {r_mig.json()}")
    except Exception as e:
        log_test("POST /api/migrate/import", False, str(e))

    print(f"\n============================================================")
    print(f" RESULTADO FINAL: {passed_tests} PASSOU | {failed_tests} FALHOU")
    print(f"============================================================\n")

    return failed_tests == 0

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
