#!/usr/bin/env python3
"""Record cited review findings and author decisions for one manuscript version."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Sequence

SCHEMA = "story-review/v1"
MAX_BODY_BYTES = 1_048_576
MAX_RECORD_BYTES = 2_097_152


class ReviewError(ValueError):
    pass


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ReviewError(message)


def text(value: object, field: str, maximum: int = 4000) -> str:
    require(isinstance(value, str) and bool(value.strip()), f"{field} must be nonempty text")
    require(len(value) <= maximum, f"{field} exceeds {maximum} characters")
    return value


def bounded_bytes(path: Path, maximum: int) -> bytes:
    with path.open("rb") as handle:
        data = handle.read(maximum + 1)
    require(len(data) <= maximum, f"{path.name} exceeds {maximum} bytes")
    return data


def read_json(path: Path) -> dict[str, Any]:
    value = json.loads(bounded_bytes(path, MAX_RECORD_BYTES).decode("utf-8"))
    require(isinstance(value, dict), "review JSON must be an object")
    return value


def book_path(root: Path, relative: str) -> Path:
    parts = relative.split("/")
    require(relative != "" and "\\" not in relative and "\0" not in relative
            and not Path(relative).is_absolute() and all(part not in {"", ".", ".."} for part in parts),
            "file must be a book-relative path without parent segments")
    path = root.joinpath(*parts)
    require(path.resolve().is_relative_to(root), "review path escapes the book directory")
    return path


def record_path(root: Path, chapter: int | None) -> Path:
    require(chapter is None or chapter >= 1, "chapter must be positive")
    name = "正文" if chapter is None else f"第{chapter:03d}章"
    return book_path(root, f".story/reviews/{name}.json")


@contextmanager
def record_lock(path: Path):
    """Serialize record replacement and finding decisions; a crashed lock needs explicit cleanup."""
    path.parent.mkdir(parents=True, exist_ok=True)
    lock = path.with_suffix(".lock")
    try:
        descriptor = os.open(lock, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    except FileExistsError as exc:
        raise ReviewError(f"review is busy; retry, or remove {lock} after confirming no review command is running") from exc
    try:
        os.write(descriptor, f"pid={os.getpid()}\n".encode("ascii"))
        yield
    finally:
        os.close(descriptor)
        lock.unlink()


def write_record(path: Path, value: dict[str, Any]) -> None:
    payload = (json.dumps(value, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    require(len(payload) <= MAX_RECORD_BYTES, "review record exceeds 2 MiB; shorten the findings")
    descriptor, temporary = tempfile.mkstemp(prefix=".review-", dir=path.parent)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, path)
    finally:
        Path(temporary).unlink(missing_ok=True)


def normalize_findings(value: object, body: str) -> list[dict[str, Any]]:
    require(isinstance(value, list) and len(value) <= 100, "findings must be an array of at most 100 entries")
    findings: list[dict[str, Any]] = []
    ids: set[str] = set()
    lines = re.split(r'\r\n|\r|\n', body)
    for row in value:
        require(isinstance(row, dict), "each finding must be an object")
        identity = text(row.get("id"), "finding.id", 80)
        require(identity not in ids, f"duplicate finding id: {identity}")
        ids.add(identity)
        severity = row.get("severity")
        require(isinstance(severity, str) and severity in {"must", "suggestion", "optional"}, f"{identity}: invalid severity")
        line = row.get("line")
        require(isinstance(line, int) and not isinstance(line, bool) and 1 <= line <= len(lines),
                f"{identity}: line must identify a manuscript line, starting at 1")
        quote = text(row.get("quote"), f"{identity}.quote", 2000)
        require(quote in lines[line - 1], f"{identity}: quote is absent from manuscript line {line}")
        findings.append({
            "id": identity, "severity": severity, "line": line, "quote": quote,
            "explanation": text(row.get("explanation"), f"{identity}.explanation"),
            "suggestion": text(row.get("suggestion"), f"{identity}.suggestion"),
            "resolution": None,
        })
    return findings


def load_record(path: Path, relative: str) -> dict[str, Any]:
    value = read_json(path)
    require(value.get("schema") == SCHEMA and value.get("body_path") == relative,
            "review record does not match this manuscript")
    body = value.get("body_text")
    require(isinstance(body, str), "review record is missing its manuscript text")
    require(hashlib.sha256(body.encode("utf-8")).hexdigest() == value.get("body_sha256"),
            "review manuscript fingerprint is invalid")
    normalized = normalize_findings(value.get("findings"), body)
    for original, finding in zip(value["findings"], normalized):
        resolution = original.get("resolution")
        if resolution is not None:
            require(isinstance(resolution, dict) and isinstance(resolution.get("kind"), str)
                    and resolution.get("kind") in {"accepted", "resolved"}
                    and resolution.get("body_sha256") == value["body_sha256"], "invalid finding resolution")
            text(resolution.get("reason"), "resolution.reason")
            finding["resolution"] = resolution
    value["findings"] = normalized
    return value


def summary(record: dict[str, Any], relative: str, digest: str) -> dict[str, Any]:
    return {
        "schema": SCHEMA, "record_path": relative,
        "status": "current" if record["body_sha256"] == digest else "stale",
        "body_sha256": record["body_sha256"], "current_body_sha256": digest,
        "findings": len(record["findings"]),
        "unresolved": sum(row["resolution"] is None for row in record["findings"]),
    }


def execute(args: argparse.Namespace) -> dict[str, Any]:
    root = args.project.resolve()
    manuscript = book_path(root, args.file)
    path = record_path(root, args.chapter)
    relative = path.relative_to(root).as_posix()
    if args.command == "status" and not path.exists():
        return {"schema": SCHEMA, "record_path": relative, "status": "missing"}
    with record_lock(path):
        body_bytes = bounded_bytes(manuscript, MAX_BODY_BYTES)
        digest = hashlib.sha256(body_bytes).hexdigest()
        if args.command == "record":
            source = read_json(args.input)
            require(source.get("body_sha256") == digest, "manuscript changed since review started; review the current version")
            mode = source.get("mode")
            require(isinstance(mode, str) and mode in {"full", "lean", "solo"}, "mode must be full, lean, or solo")
            body = body_bytes.decode("utf-8")
            record = {
                "schema": SCHEMA, "chapter": args.chapter, "body_path": args.file,
                "body_sha256": digest, "body_text": body,
                "reviewed_at": datetime.now(timezone.utc).isoformat(), "mode": mode,
                "summary": text(source.get("summary"), "summary"),
                "findings": normalize_findings(source.get("findings"), body),
            }
        else:
            record = load_record(path, args.file)
            if args.command == "status":
                return summary(record, relative, digest)
            require(record["body_sha256"] == digest == args.body_sha256,
                    "review is stale; review the current manuscript before resolving findings")
            finding = next((row for row in record["findings"] if row["id"] == args.id), None)
            require(finding is not None, f"unknown finding id: {args.id}")
            finding["resolution"] = {
                "kind": args.resolution, "reason": text(args.reason, "reason"), "body_sha256": digest,
            }
        require(bounded_bytes(manuscript, MAX_BODY_BYTES) == body_bytes,
                "manuscript changed while recording review; rerun on the current version")
        write_record(path, record)
        return summary(record, relative, digest)


def main(argv: Sequence[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    for name in ("record", "status", "resolve"):
        command = commands.add_parser(name)
        command.add_argument("--project", type=Path, required=True)
        command.add_argument("--file", required=True)
        command.add_argument("--chapter", type=int)
        if name == "record":
            command.add_argument("--input", type=Path, required=True)
        if name == "resolve":
            command.add_argument("--id", required=True)
            command.add_argument("--resolution", choices=("accepted", "resolved"), required=True)
            command.add_argument("--reason", required=True)
            command.add_argument("--body-sha256", required=True)
    args = parser.parse_args(argv)
    try:
        result = execute(args)
    except (ReviewError, OSError, UnicodeError, json.JSONDecodeError) as exc:
        result = {"schema": SCHEMA, "status": "error", "message": str(exc)}
        code = 2
    else:
        code = 0
    sys.stdout.buffer.write((json.dumps(result, ensure_ascii=False) + "\n").encode("utf-8"))
    return code


if __name__ == "__main__":
    raise SystemExit(main())
