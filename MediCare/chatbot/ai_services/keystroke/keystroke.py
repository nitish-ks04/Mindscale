from __future__ import annotations

from dataclasses import dataclass
from statistics import mean, pstdev
from typing import Any, Dict, List, Literal, Optional, TypedDict


EventType = Literal["down", "up"]


class KeystrokeEvent(TypedDict, total=False):
    t_ms: int  # timestamp in milliseconds
    key: str
    type: EventType  # "down" | "up"


@dataclass(frozen=True)
class KeystrokeFeatures:
    n_events: int
    n_keys: int
    duration_ms: int
    hold_ms_mean: float | None
    hold_ms_std: float | None
    flight_ms_mean: float | None
    flight_ms_std: float | None
    pause_count: int
    pause_ms_threshold: int
    backspace_rate: float


def _safe_mean(xs: List[float]) -> Optional[float]:
    return float(mean(xs)) if xs else None


def _safe_std(xs: List[float]) -> Optional[float]:
    return float(pstdev(xs)) if len(xs) >= 2 else None


def analyze_keystrokes(
    events: List[KeystrokeEvent],
    *,
    pause_ms_threshold: int = 800,
) -> Dict[str, Any]:
    """
    Basic keystroke dynamics feature extraction (privacy-preserving; no raw text reconstruction).

    Expected event shape:
    - { t_ms: 1710000000000, key: "a", type: "down" }
    - { t_ms: 1710000000123, key: "a", type: "up" }
    """
    if not events:
        return {
            "features": KeystrokeFeatures(
                n_events=0,
                n_keys=0,
                duration_ms=0,
                hold_ms_mean=None,
                hold_ms_std=None,
                flight_ms_mean=None,
                flight_ms_std=None,
                pause_count=0,
                pause_ms_threshold=pause_ms_threshold,
                backspace_rate=0.0,
            ).__dict__,
            "quality": {"ok": False, "reason": "no_events"},
        }

    evs = sorted(
        (e for e in events if "t_ms" in e and "type" in e),
        key=lambda e: int(e["t_ms"]),
    )
    if not evs:
        return {
            "features": {},
            "quality": {"ok": False, "reason": "invalid_events"},
        }

    t0 = int(evs[0]["t_ms"])
    t1 = int(evs[-1]["t_ms"])
    duration = max(0, t1 - t0)

    down_times: Dict[str, int] = {}
    holds: List[float] = []
    flights: List[float] = []
    pauses = 0
    backspaces = 0
    downs_total = 0
    last_down_t: Optional[int] = None

    for e in evs:
        et = e.get("type")
        key = str(e.get("key", ""))
        t = int(e["t_ms"])

        if et == "down":
            downs_total += 1
            if key in ("Backspace", "backspace", "BKSP"):
                backspaces += 1

            if last_down_t is not None:
                dt = t - last_down_t
                flights.append(float(dt))
                if dt >= pause_ms_threshold:
                    pauses += 1
            last_down_t = t

            down_times[key] = t

        elif et == "up":
            if key in down_times:
                holds.append(float(t - down_times[key]))
                del down_times[key]

    features = KeystrokeFeatures(
        n_events=len(evs),
        n_keys=downs_total,
        duration_ms=duration,
        hold_ms_mean=_safe_mean(holds),
        hold_ms_std=_safe_std(holds),
        flight_ms_mean=_safe_mean(flights),
        flight_ms_std=_safe_std(flights),
        pause_count=pauses,
        pause_ms_threshold=pause_ms_threshold,
        backspace_rate=(backspaces / downs_total) if downs_total else 0.0,
    )

    ok = duration >= 500 and downs_total >= 10
    return {
        "features": features.__dict__,
        "quality": {"ok": ok, "reason": None if ok else "insufficient_data"},
    }

