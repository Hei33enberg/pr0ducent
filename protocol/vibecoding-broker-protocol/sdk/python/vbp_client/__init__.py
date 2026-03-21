"""Minimal Python client for VBP v0.1 (broker-side). Optional dependency: requests."""

from __future__ import annotations

import json
from typing import Any, Optional
from urllib.parse import quote
from urllib.request import Request, urlopen


class VbpClient:
    def __init__(self, base_url: str, partner_key: str) -> None:
        self.base_url = base_url.rstrip("/")
        self.partner_key = partner_key

    def _url(self, path: str) -> str:
        if "/vbp/" in self.base_url:
            return f"{self.base_url}{path}"
        return f"{self.base_url}/vbp/v1{path}"

    def dispatch(self, body: dict[str, Any]) -> dict[str, Any]:
        req = Request(
            self._url("/dispatch"),
            data=json.dumps(body).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.partner_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )
        with urlopen(req, timeout=120) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}

    def status(self, provider_run_id: str) -> dict[str, Any]:
        enc = quote(provider_run_id, safe="")
        req = Request(
            self._url(f"/status/{enc}"),
            headers={"Authorization": f"Bearer {self.partner_key}", "Accept": "application/json"},
            method="GET",
        )
        with urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else {}
