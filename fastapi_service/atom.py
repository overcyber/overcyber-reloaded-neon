import html
import re
from datetime import datetime, timezone
from typing import Any
from . import db
from .config import BASE_DIR

SITE_URL = "https://overcyber.online"
FEED_TITLE = "Overcyber - Blog"
FEED_SUBTITLE = "Artigos sobre Inteligência Artificial, Engenharia de Software, Modelos de Decisão e Defesa Cibernética"
AUTHOR_NAME = "Claudio Henrique Marques"
AUTHOR_EMAIL = "contato@overcyber.online"

def markdown_to_html(md: str) -> str:
    """Converte Markdown simples em HTML seguro e semântico para leitores de feed Atom."""
    if not md:
        return ""
    text = md.strip()

    # Blocos de código ```lang ... ```
    def replace_code_block(match):
        lang = match.group(1) or ""
        code = html.escape(match.group(2))
        return f'<pre><code class="language-{lang}">{code}</code></pre>'
    text = re.sub(r'```(\w+)?\n(.*?)```', replace_code_block, text, flags=re.DOTALL)

    # Código inline `...`
    text = re.sub(r'`([^`]+)`', lambda m: f'<code>{html.escape(m.group(1))}</code>', text)

    # Imagens ![alt](url)
    def replace_img(match):
        alt = html.escape(match.group(1))
        src = match.group(2).strip()
        if src.startswith('/'):
            src = f"{SITE_URL}{src}"
        return f'<p><img src="{html.escape(src)}" alt="{alt}" style="max-width:100%;height:auto;" /></p>'
    text = re.sub(r'!\[([^\]]*)\]\(([^)]+)\)', replace_img, text)

    # Links [label](url)
    def replace_link(match):
        label = match.group(1)
        url = match.group(2).strip()
        if url.startswith('/'):
            url = f"{SITE_URL}{url}"
        return f'<a href="{html.escape(url)}">{label}</a>'
    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', replace_link, text)

    # Negrito **texto**
    text = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', text)

    # Itálico *texto*
    text = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', text)

    # Títulos e listas
    lines = []
    for line in text.split('\n'):
        line_s = line.strip()
        if line_s.startswith('### '):
            lines.append(f'<h3>{line_s[4:]}</h3>')
        elif line_s.startswith('## '):
            lines.append(f'<h2>{line_s[3:]}</h2>')
        elif line_s.startswith('# '):
            lines.append(f'<h1>{line_s[2:]}</h1>')
        elif line_s.startswith('- ') or line_s.startswith('* '):
            lines.append(f'<li>{line_s[2:]}</li>')
        elif not line_s:
            lines.append('')
        else:
            lines.append(line)

    # Agrupa em parágrafos
    paragraphs = []
    curr = []
    for l in lines:
        if l == '':
            if curr:
                joined = ' '.join(curr)
                if not (joined.startswith('<h') or joined.startswith('<pre') or joined.startswith('<li') or joined.startswith('<p>')):
                    paragraphs.append(f'<p>{joined}</p>')
                else:
                    paragraphs.append(joined)
                curr = []
        else:
            curr.append(l)
    if curr:
        joined = ' '.join(curr)
        if not (joined.startswith('<h') or joined.startswith('<pre') or joined.startswith('<li') or joined.startswith('<p>')):
            paragraphs.append(f'<p>{joined}</p>')
        else:
            paragraphs.append(joined)

    return '\n'.join(paragraphs)

def format_rfc3339(ts_str: Any) -> str:
    """Garante timestamp formatado de acordo com a RFC 3339 / ISO 8601 exigido pelo padrão Atom."""
    if not ts_str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    s = str(ts_str).strip()
    if not s.endswith("Z") and not ("+" in s or "-" in s[-6:]):
        s += "Z"
    return s

def generate_atom_feed() -> str:
    """Gera dinamicamente o XML completo do feed Atom 1.0 com todas as postagens publicadas."""
    posts = db.list_posts("published")
    latest_update = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    if posts and posts[0].get("updatedAt"):
        latest_update = format_rfc3339(posts[0].get("updatedAt"))
    elif posts and posts[0].get("publishedAt"):
        latest_update = format_rfc3339(posts[0].get("publishedAt"))

    entries_xml = []
    for p in posts:
        slug = p["slug"]
        post_url = f"{SITE_URL}/blog/{slug}"
        post_title = html.escape(p.get("title") or "Sem título")
        post_excerpt = html.escape(p.get("excerpt") or "")
        post_pub = format_rfc3339(p.get("publishedAt") or p.get("createdAt"))
        post_updated = format_rfc3339(p.get("updatedAt") or post_pub)
        content_html = markdown_to_html(p.get("content") or "")

        # Se houver imagem de capa, adiciona no topo do artigo
        image_url = p.get("image")
        if image_url:
            if image_url.startswith('/'):
                image_url = f"{SITE_URL}{image_url}"
            header_img = f'<p><img src="{html.escape(image_url)}" alt="{post_title}" style="max-width:100%;height:auto;" /></p>\n'
            content_html = header_img + content_html

        entry = f"""  <entry>
    <title>{post_title}</title>
    <link href="{post_url}" rel="alternate" type="text/html" />
    <id>{post_url}</id>
    <published>{post_pub}</published>
    <updated>{post_updated}</updated>
    <summary type="text">{post_excerpt}</summary>
    <content type="html"><![CDATA[{content_html}]]></content>
    <author>
      <name>{AUTHOR_NAME}</name>
      <email>{AUTHOR_EMAIL}</email>
      <uri>{SITE_URL}</uri>
    </author>
  </entry>"""
        entries_xml.append(entry)

    all_entries = "\n".join(entries_xml)

    feed_xml = f"""<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>{FEED_TITLE}</title>
  <subtitle>{FEED_SUBTITLE}</subtitle>
  <link href="{SITE_URL}/atom.xml" rel="self" type="application/atom+xml" />
  <link href="{SITE_URL}/blog" rel="alternate" type="text/html" />
  <id>{SITE_URL}/blog</id>
  <updated>{latest_update}</updated>
  <author>
    <name>{AUTHOR_NAME}</name>
    <email>{AUTHOR_EMAIL}</email>
    <uri>{SITE_URL}</uri>
  </author>
  <generator uri="{SITE_URL}" version="1.0">Overcyber Feed Engine</generator>
{all_entries}
</feed>
"""
    return feed_xml

def sync_atom_file():
    """Grava atom.xml estático em dist/ e public/ como backup e persistência."""
    try:
        content = generate_atom_feed()
        targets = [
            BASE_DIR / "dist" / "atom.xml",
            BASE_DIR / "public" / "atom.xml",
        ]
        # Caminho absoluto na VPS se existir
        from pathlib import Path
        vps_path = Path("/var/www/overcyber-dev/dist/atom.xml")
        if vps_path.parent.exists():
            targets.append(vps_path)

        for t in targets:
            if t.parent.exists():
                t.write_text(content, encoding="utf-8")
    except Exception:
        pass
