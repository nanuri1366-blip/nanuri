import re
import urllib.parse

with open("duck.html", "r", encoding="utf-8") as f:
    html = f.read()

# Let's find all results
# Typically in DDG HTML, each search result is in a <div class="result ...">
# We can find result__snippet and result__url

results = re.findall(r'<div class="result[^"]*">(.*?)</div>\s*</div>', html, re.DOTALL)

with open("duck_parsed.txt", "w", encoding="utf-8") as out:
    out.write(f"Found {len(results)} results in regex.\n\n")
    for r in results:
        # Extract title/url
        url_match = re.search(r'class="result__url"[^>]*href="([^"]+)"', r)
        snippet_match = re.search(r'class="result__snippet"[^>]*>(.*?)</a>', r, re.DOTALL)
        title_match = re.search(r'class="result__snippet"[^>]*title="([^"]+)"', r)
        
        decoded_url = ""
        if url_match:
            href = url_match.group(1)
            uddg_match = re.search(r'uddg=([^&]+)', href)
            if uddg_match:
                decoded_url = urllib.parse.unquote(uddg_match.group(1))
            else:
                decoded_url = href
                
        snippet = ""
        if snippet_match:
            snippet = re.sub(r'<[^>]+>', '', snippet_match.group(1)).strip()
            
        out.write(f"URL: {decoded_url}\n")
        out.write(f"Snippet: {snippet}\n")
        out.write("="*50 + "\n")
        
print("Done parsing duck.html with regex")
