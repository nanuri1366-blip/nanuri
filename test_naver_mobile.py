import urllib.request
import re
import json

url = "https://msearch.shopping.naver.com/search/all?query=%EC%9C%A0%EC%9E%90%ED%92%88%EC%9D%80%20%EA%B9%8C%EB%B6%80%EB%A6%AC%EC%99%80%20%EC%98%A4%EB%9E%80%EB%8B%A4"

req = urllib.request.Request(
    url, 
    headers={
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    }
)

try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        print(f"Success, length: {len(html)}")
        
        # Check if there is block text
        if "일시적으로 제한되었습니다" in html:
            print("Access Blocked")
        else:
            with open("naver_mobile_success.html", "w", encoding="utf-8") as f:
                f.write(html)
            print("Wrote to naver_mobile_success.html")
except Exception as e:
    print(f"Error: {e}")
