import asyncio
import httpx
import sys
import json
import urllib.parse
import os

async def test():
    base = "http://localhost:8000"
    # 1. Search for Avatar
    print("Searching for Avatar...")
    async with httpx.AsyncClient() as client:
        search_res = await client.get(f"{base}/search?q=Avatar")
        search_data = search_res.json()
        item = search_data['items'][0]
        url = item['detailPath']
        print(f"Found: {item['title']} at {url}")
        
        # 2. Get Media Info
        print(f"Fetching media info for {url}...")
        media_res = await client.get(f"{base}/media-info?url={url}")
        media_data = media_res.json()
        
        if 'downloads' not in media_data or not media_data['downloads']:
            print(f"Error: No downloads found. Response: {media_data}")
            return
            
        direct_link = media_data['downloads'][0]['url']
        print(f"Direct link obtained: {direct_link[:60]}...")
        
        # 3. Proxy it
        proxy_url = f"{base}/proxy-stream?url={urllib.parse.quote(direct_link)}"
        print(f"Proxying via: {proxy_url[:60]}...")
        
        # Download 1MB
        headers = {"Range": "bytes=0-1048576"}
        async with client.stream("GET", proxy_url, headers=headers, timeout=20) as response:
            print(f"Proxy Status: {response.status_code}")
            print(f"Proxy Headers: {dict(response.headers)}")
            
            with open("SUCCESS_TEST.mp4", "wb") as f:
                async for chunk in response.aiter_bytes():
                    f.write(chunk)
                    if f.tell() >= 1048576:
                        break
        
        size = os.path.getsize("SUCCESS_TEST.mp4")
        print(f"Final file size: {size / 1024:.2f} KB")
        if size > 1000:
            print("SUCCESS: File downloaded via proxy!")
        else:
            print("FAILURE: File too small.")

if __name__ == "__main__":
    asyncio.run(test())
