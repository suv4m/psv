#!/usr/bin/env python3
"""
Protocol State Validator (PSV) — Formal TOC Engine CLI
Author: Suvam Sabyasachi Parida (Reg ID: 2402040095)
Topic: Protocol State Validator

Theoretical Foundation:
M = (Q, Sigma, delta, q0, F)
Validates event traces w in Sigma* against deterministic finite state protocols.
Synthesizes minimum recovery traces via BFS backtracking upon protocol violation.
"""

import sys
import json
import argparse
from pathlib import Path
from collections import deque
from typing import Dict, List, Set, Tuple, Optional

# Ensure UTF-8 output for Windows console
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

class FormalDFA:
    def __init__(self, spec: dict):
        self.spec = spec
        self.id = spec.get("id", "custom")
        self.name = spec.get("name", "Custom Protocol")
        self.states: List[str] = spec["states"]
        self.alphabet: List[str] = spec["alphabet"]
        self.initial_state: str = spec["initialState"]
        self.final_states: List[str] = spec["finalStates"]
        
        self.transition_map: Dict[Tuple[str, str], str] = {}
        self.outgoing_map: Dict[str, Set[str]] = {s: set() for s in self.states}
        
        for t in spec["transitions"]:
            src, evt, dst = t["from"], t["event"], t["to"]
            self.transition_map[(src, evt)] = dst
            if src in self.outgoing_map:
                self.outgoing_map[src].add(evt)

    def delta(self, state: str, event: str) -> Optional[str]:
        return self.transition_map.get((state, event))

    def allowed_events(self, state: str) -> List[str]:
        return sorted(list(self.outgoing_map.get(state, set())))

    def is_final(self, state: str) -> bool:
        return state in self.final_states

    def is_valid_symbol(self, symbol: str) -> bool:
        return symbol in self.alphabet

    def find_shortest_recovery(self, from_state: str) -> Tuple[bool, Optional[str], List[str]]:
        """
        BFS on state graph to find shortest path to any accepting state in F.
        """
        if self.is_final(from_state):
            return True, from_state, []

        visited = {from_state}
        queue = deque([(from_state, [])])

        while queue:
            curr, path = queue.popleft()
            for evt in self.allowed_events(curr):
                nxt = self.delta(curr, evt)
                if not nxt:
                    continue
                new_path = path + [evt]
                if self.is_final(nxt):
                    return True, nxt, new_path
                if nxt not in visited:
                    visited.add(nxt)
                    queue.append((nxt, new_path))

        return False, None, []


class TraceValidator:
    def __init__(self, dfa: FormalDFA):
        self.dfa = dfa

    def verify(self, trace: List[str]) -> dict:
        curr = self.dfa.initial_state
        history = []
        failure = None

        for idx, evt in enumerate(trace):
            evt = evt.strip()
            allowed = self.dfa.allowed_events(curr)

            if not self.dfa.is_valid_symbol(evt):
                failure = {
                    "step": idx + 1,
                    "from_state": curr,
                    "event": evt,
                    "status": "UNREGISTERED_SYMBOL",
                    "allowed": allowed,
                    "error": f"Symbol '{evt}' is not in protocol alphabet Σ"
                }
                history.append(failure)
                break

            nxt = self.dfa.delta(curr, evt)
            if not nxt:
                failure = {
                    "step": idx + 1,
                    "from_state": curr,
                    "event": evt,
                    "status": "INVALID_TRANSITION",
                    "allowed": allowed,
                    "error": f"Forbidden transition δ({curr}, {evt}) is undefined (TRAP ⊥)"
                }
                history.append(failure)
                break

            history.append({
                "step": idx + 1,
                "from_state": curr,
                "event": evt,
                "to_state": nxt,
                "status": "VALID",
                "allowed": allowed
            })
            curr = nxt

        is_valid = failure is None
        is_accepted = is_valid and self.dfa.is_final(curr)

        recovery_trace = []
        recovery_target = None
        if not is_valid and failure:
            found, target, rec = self.dfa.find_shortest_recovery(failure["from_state"])
            if found:
                recovery_trace = rec
                recovery_target = target
        elif is_valid and not is_accepted:
            found, target, rec = self.dfa.find_shortest_recovery(curr)
            if found:
                recovery_trace = rec
                recovery_target = target

        return {
            "is_valid": is_valid,
            "is_accepted": is_accepted,
            "total_steps": len(history),
            "final_state": curr if is_valid else (failure["from_state"] if failure else None),
            "failure": failure,
            "history": history,
            "recovery_trace": recovery_trace,
            "recovery_target": recovery_target
        }


def format_report(res: dict, dfa: FormalDFA) -> str:
    lines = []
    lines.append("=" * 72)
    lines.append(f"  PROTOCOL STATE VALIDATOR (PSV) — VERIFICATION REPORT")
    lines.append(f"  Protocol: {dfa.name} (Initial: {dfa.initial_state}, Final: {dfa.final_states})")
    lines.append("=" * 72)

    lines.append(f"\n[EXECUTION TIMELINE]")
    for h in res["history"]:
        step = h["step"]
        src = h["from_state"]
        evt = h["event"]
        if h["status"] == "VALID":
            dst = h["to_state"]
            lines.append(f"  Step #{step:02d}: [{src}] --({evt})--> [{dst}]  ✓ VALID")
        else:
            lines.append(f"  Step #{step:02d}: [{src}] --({evt})--> [TRAP ⊥]  ✗ VIOLATION")
            lines.append(f"          ↳ Error: {h['error']}")
            lines.append(f"          ↳ Permitted in [{src}]: {h['allowed']}")

    lines.append("\n" + "-" * 72)
    if res["is_accepted"]:
        lines.append(f"RESULT: ✓ ACCEPTED (w ∈ L(M))")
        lines.append(f"Protocol terminated cleanly in quiescent accepting state: [{res['final_state']}]")
    elif res["is_valid"] and not res["is_accepted"]:
        lines.append(f"RESULT: ⚠ INCOMPLETE (w ∉ L(M), non-accepting state)")
        lines.append(f"All steps valid, but terminated prematurely in intermediate state: [{res['final_state']}]")
        if res["recovery_trace"]:
            lines.append(f"Recovery to [{res['recovery_target']}]: {' -> '.join(res['recovery_trace'])}")
    else:
        lines.append(f"RESULT: ✗ VIOLATION DETECTED")
        fail = res["failure"]
        lines.append(f"Protocol broke at step #{fail['step']} in state [{fail['from_state']}] on event '{fail['event']}'")
        if res["recovery_trace"]:
            lines.append(f"Minimum Backtracking Recovery Path: {' -> '.join(res['recovery_trace'])} -> [{res['recovery_target']}]")
        else:
            lines.append("No recovery path available (irrecoverable sink trap).")
    lines.append("=" * 72)
    return "\n".join(lines)


def load_preset(name_or_path: str) -> dict:
    preset_dir = Path(__file__).parent / "protocols"
    alias_map = {
        "tcp": preset_dir / "tcp.json",
        "oauth": preset_dir / "oauth.json",
    }
    
    target_path = alias_map.get(name_or_path.lower())
    if not target_path or not target_path.exists():
        target_path = Path(name_or_path)

    if not target_path.exists():
        print(f"Error: Protocol definition not found: {name_or_path}", file=sys.stderr)
        sys.exit(1)

    with open(target_path, "r", encoding="utf-8") as f:
        return json.load(f)


def main():
    parser = argparse.ArgumentParser(
        description="Protocol State Validator — Formal TOC Verification Engine"
    )
    parser.add_argument(
        "--protocol", "-p",
        default="tcp",
        help="Protocol preset ('tcp', 'oauth') or path to protocol JSON file"
    )
    parser.add_argument(
        "--trace", "-t",
        help="Comma-separated sequence of event symbols to verify"
    )
    parser.add_argument(
        "--demo",
        choices=["valid", "invalid"],
        help="Run built-in demonstration trace"
    )

    args = parser.parse_args()

    spec = load_preset(args.protocol)
    dfa = FormalDFA(spec)
    validator = TraceValidator(dfa)

    if args.demo:
        if args.protocol.lower() == "tcp":
            if args.demo == "valid":
                trace = ["ACTIVE_OPEN", "RCV_SYN_ACK", "SEND_DATA", "RCV_DATA", "CLOSE_APP", "RCV_ACK", "RCV_FIN", "TIMEOUT_2MSL"]
            else:
                trace = ["ACTIVE_OPEN", "SEND_DATA"]
        else:
            if args.demo == "valid":
                trace = ["GEN_CODE_VERIFIER", "REDIRECT_TO_AUTH_SERVER", "USER_APPROVES_CONSENT", "RECEIVE_AUTH_CODE", "POST_TOKEN_WITH_VERIFIER", "TOKEN_SUCCESS", "ACCESS_API_RESOURCE", "REVOKE_TOKEN"]
            else:
                trace = ["GEN_CODE_VERIFIER", "POST_TOKEN_WITH_VERIFIER"]
    elif args.trace:
        trace = [x.strip() for x in args.trace.split(",") if x.strip()]
    else:
        # Default prompt
        print(f"Loaded protocol: {dfa.name} ({len(dfa.states)} states, {len(dfa.alphabet)} symbols)")
        print(f"Alphabet Σ: {', '.join(dfa.alphabet[:8])}...")
        print("Tip: Run with --demo valid or --demo invalid, or pass --trace 'EVT1,EVT2'")
        return

    result = validator.verify(trace)
    print(format_report(result, dfa))


if __name__ == "__main__":
    main()
