import asyncio
import httpx
import os

MIRROR_HOSTS = (
    "h5.aoneroom.com",
    "movieboxapp.in",
    "moviebox.pk",
    "moviebox.ph",
    "moviebox.id",
    "v.moviebox.ph",
    "netnaija.video",
)

async def check_mirror(host):
    url = f"https://{host}/"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            print(f"{host}: {response.status_code}")
            return host, response.status_code == 200
    except Exception as e:
        print(f"{host}: Error - {e}")
        return host, False

async def main():
    tasks = [check_mirror(host) for host in MIRROR_HOSTS]
    results = await asyncio.gather(*tasks)
    working = [host for host, ok in results if ok]
    print(f"\nWorking mirrors: {working}")

if __name__ == "__main__":
    asyncio.run(main())
