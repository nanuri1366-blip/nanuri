import urllib.request
import urllib.parse
import re
import json

target_url = "https://search.shopping.naver.com/search/all?query=%EC%9C%A0%EC%9E%90%ED%92%88%EC%9D%80%20%EA%B9%8C%EB%B6%80%EB%A6%AC%EC%99%80%20%EC%98%A4%EB%9E%80%EB%8B%A4&frm=NVSCPRO&nl-ts-pid=jC2p9dqX6IRssUyDJ4Z-361028"
proxy_url = "https://api.allorigins.win/raw?url=" + urllib.parse.quote_plus(target_url)

req = urllib.request.Request(
    proxy_url, 
    headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    }
)

with open("proxy_result.txt", "w", encoding="utf-8") as out:
    try:
        with urllib.request.urlopen(req) as response:
            html = response.read().decode('utf-8')
            out.write(f"Success, length: {len(html)}\n")
            
            if "일시적으로 제한되었습니다" in html:
                out.write("Access Blocked via Proxy\n")
            else:
                with open("naver_proxy.html", "w", encoding="utf-8") as f:
                    f.write(html)
                out.write("Wrote to naver_proxy.html\n")
                
                match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html)
                if match:
                    out.write("Found __NEXT_DATA__\n")
                    data = json.loads(match.group(1))
                    with open("next_data_proxy.json", "w", encoding="utf-8") as f:
                        json.dump(data, f, ensure_ascii=False, indent=2)
                else:
                    out.write("Could not find __NEXT_DATA__\n")
    except Exception as e:
        out.write(f"Error: {e}\n")
print("Done writing proxy_result.txt")
