import asyncio
import httpx
from moviebox_api import Session
import os

async def debug_session():
    # Set host
    os.environ["MOVIEBOX_API_HOST"] = "h5.aoneroom.com"
    
    print(f"Testing session handshake for {os.environ['MOVIEBOX_API_HOST']}...")
    s = Session()
    
    try:
        # Change headers to match the old one for testing
        s._client.headers["Referer"] = "https://fmoviesunblocked.net/"
        # Try a handshake
        await s.ensure_cookies_are_assigned()
        print(f"Cookies in jar: {list(s._client.cookies.keys())}")
        
    except Exception as e:
        print(f"Handshake failed: {e}")

    # Try download again
    url = f"https://h5.aoneroom.com/wefeed-h5-bff/web/subject/download?subjectId=4134011653899829912&se=1&ep=1"
    print(f"\nTesting download endpoint: {url}")
    try:
        # Manual headers for download
        headers = {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
            "Referer": "https://h5.aoneroom.com/detail/monarch-legacy-of-monsters-AcrCDrFOnV4?id=4134011653899829912",
            "Origin": "https://h5.aoneroom.com"
        }
        resp = await s._client.get(url, headers=headers)
        print(f"Download response status: {resp.status_code}")
        if resp.status_code != 200:
            print(f"Response text: {resp.text[:200]}")
    except Exception as e:
        print(f"Download request failed: {e}")

if __name__ == "__main__":
    asyncio.run(debug_session())
