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
        # Calls fetch_app_info internally
        present = await s.ensure_cookies_are_assigned()
        print(f"Handshake success: {present}")
        
        print("\nAll Cookies in Jar:")
        for cookie in s._client.cookies.jar:
            print(f"- {cookie.name}={cookie.value[:20]}... domain={cookie.domain}")
            
    except Exception as e:
        print(f"Handshake failed: {e}")

    # Try a simple download request
    url = "https://h5.aoneroom.com/wefeed-h5-bff/web/subject/download?subjectId=4134011653899829912&se=1&ep=1"
    print(f"\nTesting download endpoint: {url}")
    try:
        # Use get_with_cookies directly to see what happens
        resp = await s.get_with_cookies(url)
        print(f"Download response status: {resp.status_code}")
    except Exception as e:
        print(f"Download request failed: {e}")
        if hasattr(e, 'response'):
            print(f"Response status: {e.response.status_code}")
            print(f"Response data: {e.response.text[:200]}")

if __name__ == "__main__":
    asyncio.run(debug_session())
