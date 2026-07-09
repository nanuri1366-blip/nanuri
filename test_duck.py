import urllib.request
import urllib.parse
import re

query = '유자품은 까부리와 오란다'
url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote_plus(query)

req = urllib.request.Request(
    url, 
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
)

with open("duck_result.txt", "w", encoding="utf-8") as out:
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            out.write(f"Success, length: {len(html)}\n")
            
            # Find all links
            links = re.findall(r'href="([^"]+)"', html)
            out.write(f"Found {len(links)} links:\n")
            for link in set(links):
                if 'naver.com' in link or 'smartstore' in link or 'shopping' in link:
                    out.write(f"- Naver link: {link}\n")
                elif 'pension' in link or 'goods' in link or 'mall' in link:
                    out.write(f"- Other link: {link}\n")
            
            # Let's save the HTML for debug
            with open("duck.html", "w", encoding="utf-8") as f:
                f.write(html)
    except Exception as e:
        out.write(f"Error: {e}\n")
print("Done writing duck_result.txt")
