from typing import Dict, List

MAX_DIFF_CHARS = 4000


def build_diff_summary(files: List[Dict]) -> Dict:
    extensions = set()
    total_additions = 0
    total_deletions = 0

    for f in files:
        total_additions += f.get("additions", 0)
        total_deletions += f.get("deletions", 0)

        filename = f.get("filename", "")
        if "." in filename:
            extensions.add(filename.rsplit(".", 1)[-1])

    return {
        "files_changed": len(files),
        "lines_added": total_additions,
        "lines_deleted": total_deletions,
        "files_extensions": list(extensions),
    }


def extract_patch_text(files: List[Dict]) -> str:
    patches = []

    for f in files:
        patch = f.get("patch")
        if patch:
            patches.append(patch)

    return "\n\n".join(patches)


def limit_diff_text(diff_text: str) -> str:
    if len(diff_text) <= MAX_DIFF_CHARS:
        return diff_text

    return diff_text[:MAX_DIFF_CHARS] + "\n\n[TRUNCATED]"
