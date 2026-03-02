import asyncio
import os
import sys

# Add src to sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
src_path = os.path.join(current_dir, "src")
if src_path not in sys.path:
    sys.path.insert(0, src_path)

os.environ["MOVIEBOX_API_HOST"] = "movieboxapp.in"

from moviebox_api import Search, DownloadableMovieFilesDetail, Session

async def check():
    session = Session(timeout=30)
    # Search for something popular
    s = Search(session, "Prison Break")
    res = await s.get_content_model()
    
    for item in res.items[:5]:
        print(f"Checking: {item.title} ({item.subjectId})")
        d = DownloadableMovieFilesDetail(session, item)
        try:
            content = await d.get_content_model()
            print(f" - Downloads count: {len(content.downloads)}")
            if content.downloads:
                print(f" - SUCCESS: Found resolutions: {[x.resolution for x in content.downloads]}")
                return item, content
        except Exception as e:
            print(f" - Failed: {e}")
    return None, None

if __name__ == "__main__":
    asyncio.run(check())
