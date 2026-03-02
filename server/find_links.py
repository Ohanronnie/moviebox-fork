import asyncio
import os
import sys

# Add src to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
src_path = os.path.join(current_dir, "src")
if src_path not in sys.path:
    sys.path.insert(0, src_path)

from moviebox_api import Search, DownloadableMovieFilesDetail, Session

async def find_working_movie():
    # Try different hosts
    hosts = ["moviebox.ph", "movieboxapp.in", "moviebox.pk"]
    queries = ["Avatar", "The Dark Knight", "Inception", "Titanic"]
    
    for host in hosts:
        print(f"--- Testing Host: {host} ---")
        os.environ["MOVIEBOX_API_HOST"] = host
        session = Session(timeout=20)
        
        for query in queries:
            print(f"Searching for '{query}'...")
            try:
                s = Search(session, query)
                res = await s.get_content_model()
                
                for item in res.items[:3]:
                    print(f"  Checking: {item.title} ({item.subjectId})")
                    d = DownloadableMovieFilesDetail(session, item)
                    content = await d.get_content_model()
                    if content.downloads:
                        print(f"  READY: Found {len(content.downloads)} resolutions for {item.title}")
                        return host, item, content
                    else:
                        print(f"  No downloads found for this item.")
            except Exception as e:
                print(f"  Search/Detail failed: {e}")
    return None, None, None

if __name__ == "__main__":
    asyncio.run(find_working_movie())
