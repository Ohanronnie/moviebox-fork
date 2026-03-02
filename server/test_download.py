import asyncio
import os
import sys

# Setup environment
current_dir = os.path.dirname(os.path.abspath(__file__))
src_path = os.path.join(current_dir, "src")
if src_path not in sys.path:
    sys.path.insert(0, src_path)

# moviebox.ph (the host) is working for searches, but the app-pkgs endpoint is specifically 404.
# We'll PATCH the Session class to bypass the cookie/app-info check for this test.
from moviebox_api.requests import Session
import httpx

# Patch-out the cookie check which is failing due to 404
Session.ensure_cookies_are_assigned = lambda self: asyncio.sleep(0)
Session._fetch_app_info = lambda self: asyncio.sleep(0)

from moviebox_api import MovieAuto

async def partial_download():
    # Setup output directory
    test_dir = os.path.join(current_dir, "test_output")
    if not os.path.exists(test_dir):
        os.makedirs(test_dir)
    else:
        for f in os.listdir(test_dir):
            try:
                os.remove(os.path.join(test_dir, f))
            except: pass
            
    os.environ["MOVIEBOX_API_HOST"] = "moviebox.ph"
    print(f"USING HOST: {os.environ['MOVIEBOX_API_HOST']}")
    
    auto = MovieAuto(
        dir=test_dir, 
        caption_dir=test_dir, 
        part_dir=test_dir,
        timeout=30.0
    )
    
    query = "Avatar"
    print(f"SEARCHING '{query}'...")
    
    try:
        # Search and Get Details
        target_movie, details = await auto._search_handler(query, year=None)
        print(f"FOUND: {target_movie.title} ({target_movie.subjectId})")
        
        # 1. Download Caption (Complete)
        # Check all available languages
        avail_langs = [c.lanName for c in details.captions]
        print(f"AVAILABLE CAPTIONS: {avail_langs}")
        
        lang = "English" if "English" in avail_langs else (avail_langs[0] if avail_langs else None)
        
        if lang:
            print(f"DOWNLOADING '{lang}' caption...")
            try:
                caption_res = await auto._caption_download_handler(
                    details, lang, filename=target_movie
                )
                print(f"CAPTION SAVED: {os.path.relpath(caption_res.saved_to)}")
            except Exception as e:
                print(f"CAPTION FAILED: {e}")
        
        # 2. Download Movie (2-3 seconds only)
        if details.downloads:
            media_file = details.worst_media_file
            print(f"STARTING {media_file.resolution}P download ({media_file.size / (1024*1024):.2f} MB)...")
            
            download_task = asyncio.create_task(
                auto.media_file_downloader.run(
                    media_file, 
                    filename=target_movie,
                    disable_progress_bar=True
                )
            )
            
            print("Capturing data (~5 seconds)...")
            await asyncio.sleep(5)
            download_task.cancel()
            
            try:
                await download_task
            except asyncio.CancelledError:
                print("STREAM STOPPED.")
            
            # Verify artifacts
            print("\nFILES GENERATED in test_output:")
            found_any = False
            for r, d, f in os.walk(test_dir):
                for file in f:
                    path = os.path.join(r, file)
                    size_kb = os.path.getsize(path) / 1024
                    print(f" - {os.path.relpath(path, test_dir)} | {size_kb:.2f} KB")
                    found_any = True
            
            if not found_any:
                print("No files found. The server likely refused the connection or IP is blocked.")
        else:
            print("No downloads available for this title.")

    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    asyncio.run(partial_download())
