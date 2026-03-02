import asyncio
import httpx
from moviebox_api.extractor.helpers import souper
from json import loads, dumps

async def debug_json():
    # Set host
    host = "movieboxapp.in"
    url = f"https://{host}/detail/the-night-agent-QmKtaMxB3N5?id=4860601308702802872"
    headers = {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:137.0) Gecko/20100101 Firefox/137.0",
        "Referer": f"https://{host}/",
    }
    
    print(f"Fetching {url}...")
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers=headers)
        if resp.status_code != 200:
            print(f"Error: {resp.status_code}")
            return
            
        # Extract from application/json script
        try:
            from_script = souper(resp.text).find("script", {"type": "application/json"}).text
            data = loads(from_script)
            
            # Use the logic from JsonDetailsExtractor.extract
            extracts = []
            def resolve_value(v):
                if type(v) is list:
                    return [resolve_value(data[index] if type(index) is int else index) for index in v]
                elif type(v) is dict:
                    res = {}
                    for k, val in v.items():
                        res[k] = resolve_value(data[val])
                    return res
                return v

            for entry in data:
                if type(entry) is dict:
                    details = {}
                    for key, index in entry.items():
                        details[key] = resolve_value(data[index])
                    extracts.append(details)
            
            if extracts:
                raw_data = extracts[0]["state"][1]
                processed = dict(
                    zip(
                        [key[2:] for key in raw_data.keys()],
                        raw_data.values(),
                    )
                )
                
                # Print keys to see what's changed
                print("\nKeys in extracted data:")
                for k in sorted(processed.keys()):
                    print(f"- {k}")
                
                # Look into resData
                if "resData" in processed:
                    print("\nKeys in resData:")
                    for k in sorted(processed["resData"].keys()):
                        print(f"  - {k}")
            else:
                print("No extracts found")
        except Exception as e:
            print(f"Debug error: {e}")

if __name__ == "__main__":
    asyncio.run(debug_json())
