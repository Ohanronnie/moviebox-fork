import asyncio
import os
from moviebox_api import Session, DownloadableMovieFilesDetail
from moviebox_api.models import SearchResultsItem

async def test_media_info():
    os.environ["MOVIEBOX_API_HOST"] = "h5.aoneroom.com"
    s = Session()
    
    # Mock a SearchResultsItem for Avatar
    # From verify_download results: detailPath='avatar-WLDIi21IUBa', subjectId='2518237873669820192'
    item = SearchResultsItem(
        detailPath="avatar-WLDIi21IUBa",
        subjectId="2518237873669820192",
        title="Avatar",
        releaseDate="2009-12-18",
        subjectType="/movie/detail",
        genre=["Action","Adventure","Fantasy"],
        subtitles=["English"],
        ops={"subjectId": "2518237873669820192"},
        hasResource=True,
        imdbRatingCount=0,
        cover={"url": "https://example.com/cover.jpg", "type": "image/jpeg"}
    )
    
    downloader = DownloadableMovieFilesDetail(s, item)
    try:
        print("Calling downloader.get_content()...")
        content = await downloader.get_content()
        print(f"Content: {content}")
    except Exception as e:
        print(f"FAILED: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_media_info())
