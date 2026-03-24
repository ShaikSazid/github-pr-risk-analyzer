from typing import List, Dict

MAX_FILES = 5
MAX_LINES_PER_FILE = 300
MAX_TOTAL_CHARS = 15000


def _extract_relevant_lines(patch: str, include_deletions: bool) -> List[str]:
    if not patch:
        return []

    lines = patch.splitlines()
    selected = []

    for i, line in enumerate(lines):
        if line.startswith("+") and not line.startswith("+++"):
            # include 2 lines before and after for context
            start = max(i - 2, 0)
            end = min(i + 3, len(lines))
            selected.extend(lines[start:end])

        if include_deletions and line.startswith("-") and not line.startswith("---"):
            selected.append(line)

    return selected


def build_selected_patch(
    files_data: List[Dict],
    risk_score: float
) -> str:

    if risk_score <= 3:
        return ""

    include_deletions = risk_score >= 7

    sorted_files = sorted(
        files_data,
        key=lambda f: f.get("additions", 0) + f.get("deletions", 0),
        reverse=True
    )

    selected_files = sorted_files[:MAX_FILES]

    sections = []
    total_chars = 0

    for file in selected_files:
        filename = file.get("filename")
        patch = file.get("patch", "")

        relevant_lines = _extract_relevant_lines(patch, include_deletions)

        if not relevant_lines:
            continue

        relevant_lines = relevant_lines[:MAX_LINES_PER_FILE]

        section = f"\nFile: {filename}\n" + "\n".join(relevant_lines)

        if total_chars + len(section) > MAX_TOTAL_CHARS:
            break

        sections.append(section)
        total_chars += len(section)

    return "\n\n".join(sections)