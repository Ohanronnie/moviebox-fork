import asyncio

from moviebox_api import Session
from moviebox_api.core import Search
from moviebox_api.constants import HOST_URL, SubjectType
from moviebox_api.download import DownloadableMovieFilesDetail


async def main() -> None:
    print(f"HOST_URL = {HOST_URL}")
    session = Session()

    search = Search(
        session=session,
        query="Avatar",
        subject_type=SubjectType.MOVIES,
        per_page=5,
    )
    results = await search.get_content_model()
    first = results.first_item
    print("First search result:")
    print(f"  subjectId={first.subjectId}")
    print(f"  detailPath={first.detailPath}")
    print(f"  page_url={first.page_url}")

    downloader = DownloadableMovieFilesDetail(session, first)
    meta = await downloader.get_content_model()
    print("Download meta (backend fork):")
    print(f"  hasResource={meta.hasResource}")
    print(f"  downloads={len(meta.downloads)}")
    for d in meta.downloads:
        print(f"    - {d.resolution}p -> {d.url}")


if __name__ == "__main__":
    asyncio.run(main())

