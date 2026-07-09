import urllib.request
import re

urls = [
    "https://blog.naver.com/minee0630/223098021850",
    "https://blog.naver.com/smoke6011/223654223957"
]

with open("blog_links.txt", "w", encoding="utf-8") as out:
    for url in urls:
        out.write(f"=== Fetching {url} ===\n")
        req = urllib.request.Request(
            url, 
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            }
)
        try:
            with urllib.request.urlopen(req) as response:
                html = response.read().decode('utf-8')
                out.write(f"Length: {len(html)}\n")
                
                # Check for iframe (Naver blogs load content inside iframe)
                # Typically, Naver blog iframe src is like: /PostView.naver?blogId=...&logNo=...
                iframe_match = re.search(r'id="mainFrame"[^>]*src="([^"]+)"', html)
                if iframe_match:
                    iframe_url = "https://blog.naver.com" + iframe_match.group(1)
                    out.write(f"Found iframe URL: {iframe_url}\n")
                    
                    # Fetch iframe
                    iframe_req = urllib.request.Request(
                        iframe_url,
                        headers={
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                        }
                    )
                    with urllib.request.urlopen(iframe_req) as iframe_resp:
                        iframe_html = iframe_resp.read().decode('utf-8', errors='ignore')
                        out.write(f"Iframe Length: {len(iframe_html)}\n")
                        
                        # Find smartstore links
                        smartstores = re.findall(r'https?://smartstore\.naver\.com/[^\s"\'><]+', iframe_html)
                        out.write(f"Found smartstore links: {smartstores}\n")
                        
                        # Let's save a bit of text/context around smartstore
                        for ss in set(smartstores):
                            out.write(f"Smartstore: {ss}\n")
                else:
                    out.write("No iframe found\n")
        except Exception as e:
            out.write(f"Error fetching {url}: {e}\n")
        out.write("="*50 + "\n")
print("Done checking blogs")
