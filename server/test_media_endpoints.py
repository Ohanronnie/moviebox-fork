import argparse
import sys
from typing import Any, Dict

import httpx


DEFAULT_BASE_URL = "http://127.0.0.1:8000"


def call_media_info(
    base_url: str,
    detail_url: str,
    is_series: bool,
    season: int,
    episode: int,
) -> Dict[str, Any]:
    """Call the FastAPI /media-info endpoint and return the parsed JSON."""
    params: Dict[str, Any] = {"url": detail_url, "is_series": is_series}
    if is_series:
        params["season"] = season
        params["episode"] = episode

    resp = httpx.get(f"{base_url}/media-info", params=params, timeout=60.0)
    resp.raise_for_status()
    data = resp.json()

    print(f"\n[media-info] status={resp.status_code}")
    print("[media-info] response JSON:")
    print(data)

    return data


def maybe_test_proxy_stream(base_url: str, media_info: Dict[str, Any]) -> None:
    """If media-info returned at least one download, smoke-test /proxy-stream."""
    downloads = media_info.get("downloads") or []
    if not downloads:
        print("\n[proxy-stream] skipped (no downloads available in media-info).")
        return

    first = downloads[0]
    url = first.get("url")
    if not url:
        print("\n[proxy-stream] skipped (download entry missing URL).")
        return

    print(f"\n[proxy-stream] Testing proxy for first download URL:\n{url}")

    # Request only the first kilobyte via Range to keep it light.
    headers = {"Range": "bytes=0-1023"}
    prox_resp = httpx.get(
        f"{base_url}/proxy-stream",
        params={"url": url},
        headers=headers,
        timeout=30.0,
    )

    print(f"[proxy-stream] status={prox_resp.status_code}")
    print("[proxy-stream] selected headers:")
    for key in ("Content-Type", "Content-Length", "Content-Range", "Accept-Ranges"):
        if key in prox_resp.headers:
            print(f"  {key}: {prox_resp.headers[key]}")


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Smoke-test /media-info and /proxy-stream against the local FastAPI server.",
    )
    parser.add_argument(
        "--base-url",
        default=DEFAULT_BASE_URL,
        help=f"Base URL of the backend (default: {DEFAULT_BASE_URL})",
    )
    parser.add_argument(
        "--url",
        required=True,
        help=(
            "Full detail page URL to test, e.g. "
            "'https://h5.aoneroom.com/detail/avatar-WLDIi21IUBa?id=2518237873669820192'"
        ),
    )
    parser.add_argument(
        "--series",
        action="store_true",
        help="Treat the item as a TV series (adds season/episode params to /media-info).",
    )
    parser.add_argument(
        "--season",
        type=int,
        default=1,
        help="Season number to request for series items (default: 1).",
    )
    parser.add_argument(
        "--episode",
        type=int,
        default=1,
        help="Episode number to request for series items (default: 1).",
    )

    args = parser.parse_args(argv)

    try:
        media_info = call_media_info(
            base_url=args.base_url,
            detail_url=args.url,
            is_series=args.series,
            season=args.season,
            episode=args.episode,
        )
        maybe_test_proxy_stream(args.base_url, media_info)
    except Exception as exc:
        print(f"\n[error] {exc!r}")
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

