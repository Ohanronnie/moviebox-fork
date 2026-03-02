from fastapi import FastAPI, Query, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
import typing as t
import httpx
import logging
import traceback

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("moviebox-api")

from moviebox_api import (
    Session,
    Search,
    Trending,
    Homepage,
    MovieDetails,
    TVSeriesDetails,
    DownloadableMovieFilesDetail,
    DownloadableTVSeriesFilesDetail,
    SubjectType,
    Recommend,
    PopularSearch,
    SearchSuggestion,
    HotMoviesAndTVSeries,
)
from moviebox_api.constants import DOWNLOAD_REQUEST_HEADERS
from moviebox_api.models import (
    SearchResultsModel, 
    HomepageContentModel, 
    HotMoviesAndTVSeriesModel,
    PopularSearchModel,
    SuggestedItemsModel,
    SearchResultsItem,
)
from moviebox_api.extractor.models.json import ItemJsonDetailsModel

# Global session to be used across the app
session: Session = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    global session
    logger.info("Initializing MovieBox API Session (Timeout: 30s)...")
    session = Session(timeout=30.0)
    yield
    logger.info("Shutting down...")

app = FastAPI(
    title="MovieBox API Backend",
    description="A FastAPI backend for moviebox-api to serve mobile/web applications.",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to MovieBox API Backend", "docs": "/docs"}

@app.get("/home")
async def get_homepage():
    """Fetch homepage content (trending, banners, etc.)"""
    logger.info("Fetching homepage content...")
    try:
        hp = Homepage(session)
        content = await hp.get_content_model()
        return content
    except Exception:
        logger.error(f"Error fetching homepage: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/trending")
async def get_trending(
    page: int = 0,
    per_page: int = 18
):
    """Fetch trending movies and series"""
    logger.info(f"Fetching trending (page={page}, per_page={per_page})...")
    try:
        trending = Trending(session, page=page, per_page=per_page)
        content = await trending.get_content_model()
        return content
    except Exception:
        logger.error(f"Error fetching trending: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/search")
async def search(
    q: str,
    type: SubjectType = SubjectType.ALL,
    page: int = 1,
    per_page: int = 24
):
    """Search for movies or series"""
    logger.info(f"Searching for '{q}' (type={type}, page={page})...")
    try:
        s = Search(session, query=q, subject_type=type, page=page, per_page=per_page)
        content = await s.get_content_model()
        return content
    except Exception:
        logger.error(f"Error during search: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/search/suggest")
async def search_suggest(q: str, per_page: int = 10):
    """Get title suggestions based on a partial keyword"""
    logger.info(f"Fetching suggestions for '{q}'...")
    try:
        ss = SearchSuggestion(session, per_page=per_page)
        content = await ss.get_content_model(q)
        return content
    except Exception:
        logger.error(f"Error fetching suggestions: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/details")
async def get_details(url: str, is_series: bool = False):
    """Get detailed information about a movie or series using its page URL"""
    logger.info(f"Fetching details for URL: {url} (is_series={is_series})")
    try:
        if is_series:
            details = TVSeriesDetails(url, session)
        else:
            details = MovieDetails(url, session)
            
        content = await details.get_content_model()
        return content
    except Exception:
        logger.error(f"Error fetching details: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail="Failed to fetch details")

@app.get("/recommendations")
async def get_recommendations(url: str, is_series: bool = False, page: int = 1):
    """Get movie/series recommendations based on a reference item URL"""
    logger.info(f"Fetching recommendations for URL: {url} (page={page})")
    try:
        if is_series:
            details_caller = TVSeriesDetails(url, session)
        else:
            details_caller = MovieDetails(url, session)
        
        details_model = await details_caller.get_content_model()
        subject_data = details_model.resData.subject.model_dump()
        
        if isinstance(subject_data.get("genre"), list):
            subject_data["genre"] = ",".join(subject_data["genre"])
        if isinstance(subject_data.get("subtitles"), list):
            subject_data["subtitles"] = ",".join(subject_data["subtitles"])
            
        if isinstance(subject_data.get("trailer"), dict):
            video_address = subject_data["trailer"].get("videoAddress")
            if video_address:
                subject_data["trailer"] = str(video_address.get("url", ""))
            else:
                subject_data["trailer"] = None
        
        if not subject_data.get("ops"):
            subject_data["ops"] = '{"rid":"00000000-0000-0000-0000-000000000000","trace_id":"0"}'

        item = SearchResultsItem(**subject_data)
        
        rec = Recommend(session, item, page=page)
        content = await rec.get_content_model()
        return content
    except Exception:
        logger.error(f"Error fetching recommendations: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail="Failed to fetch recommendations")

@app.get("/ranks")
async def get_ranks():
    """Get hot movies and TV series rankings"""
    logger.info("Fetching rankings...")
    try:
        ranks = HotMoviesAndTVSeries(session)
        content = await ranks.get_content_model()
        return content
    except Exception:
        logger.error(f"Error fetching rankings: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/popular-searches")
async def get_popular_searches():
    """Get titles many people are searching for"""
    logger.info("Fetching popular searches...")
    try:
        ps = PopularSearch(session)
        content = await ps.get_content_model()
        return content
    except Exception:
        logger.error(f"Error fetching popular searches: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@app.get("/media-info")
async def get_media_info(url: str, is_series: bool = False, season: int = 1, episode: int = 1):
    """Get download/stream metadata"""
    logger.info(f"Fetching media info for {url} (S{season}E{episode})")
    try:
        if is_series:
            details_caller = TVSeriesDetails(url, session)
        else:
            details_caller = MovieDetails(url, session)
            
        item_model = await details_caller.get_content_model()
        
        if is_series:
            downloader = DownloadableTVSeriesFilesDetail(session, item_model)
            media_info = await downloader.get_content_model(season=season, episode=episode)
        else:
            downloader = DownloadableMovieFilesDetail(session, item_model)
            media_info = await downloader.get_content_model()
            
        return media_info
    except Exception:
        logger.error(f"Error fetching media info: {traceback.format_exc()}")
        raise HTTPException(status_code=400, detail="Failed to fetch media info")

@app.get("/proxy-stream")
async def proxy_stream(
    url: str,
    range: t.Optional[str] = Header(None)
):
    """Proxy-stream route with logging"""
    logger.info(f"Proxy streaming URL: {url[:50]}... (Range: {range})")
    headers = DOWNLOAD_REQUEST_HEADERS.copy()
    if range:
        headers["Range"] = range
        
    timeout = httpx.Timeout(10.0, read=None)
    client = httpx.AsyncClient(timeout=timeout)
    
    try:
        request = client.build_request("GET", url, headers=headers)
        response = await client.send(request, stream=True)
        
        response_headers = {
            "Accept-Ranges": response.headers.get("Accept-Ranges", "bytes"),
            "Content-Length": response.headers.get("Content-Length"),
            "Content-Type": response.headers.get("Content-Type", "video/mp4"),
            "Content-Range": response.headers.get("Content-Range"),
        }
        response_headers = {k: v for k, v in response_headers.items() if v is not None}

        async def generate():
            try:
                async for chunk in response.aiter_bytes(chunk_size=256 * 1024):
                    yield chunk
            except Exception:
                logger.error(f"Stream interrupted: {traceback.format_exc()}")
            finally:
                await response.aclose()
                await client.aclose()

        return StreamingResponse(
            generate(),
            status_code=response.status_code,
            headers=response_headers,
            media_type=response_headers.get("Content-Type")
        )
        
    except Exception:
        logger.error(f"Proxy stream error: {traceback.format_exc()}")
        await client.aclose()
        raise HTTPException(status_code=500, detail="Streaming failed")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
