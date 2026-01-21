import os
import time

import dotenv
import pandas as pd
from github import Auth, Github, RateLimitExceededException

dotenv.load_dotenv()

TOKEN = os.getenv("GITHUB_TOKEN")
OUTPUT_FILE = "data/raw/multi_repo_data.csv"
PR_LIMIT_PER_REPO = 150
MAX_FILES_CHECK = 50

# List of repositories to mine
TARGET_REPOS = [
    "pallets/flask",
    "django/django",
    "requests/requests",
    "psf/black",
    "tiangolo/fastapi",
    "keras-team/keras",
    "scikit-learn/scikit-learn",
    "tinygrad/tinygrad",
    "ghostty-org/ghostty",
    "shadcn-ui/ui",
    "oven-sh/bun",  # Fast JS runtime (Zig/C++)
    "resend/react-email",  # Modern email components
    "t3-oss/create-t3-app",  # Popular full-stack starter
    "astral-sh/uv",  # Extremely fast Python package manager
    "pola-rs/polars",  # Fast Dataframes (Rust)
    "bevyengine/bevy",  # Data-driven game engine (Rust)
    "typst/typst",  # Modern LaTeX alternative
    "zed-industries/zed",
    "helix-editor/helix",
    "lapce/lapce",  # Another fast Rust editor
    "obsidian-md/obsidian-releases",
    "excalidraw/excalidraw",
    "karpathy/nanoGPT",  # Andrej Karpathy's teaching repo
    "ggerganov/llama.cpp",  # Run LLMs on CPU (C++)
    "ggerganov/whisper.cpp",
    "AUTOMATIC1111/stable-diffusion-webui",  # The standard for SD generation
    "imartinez/privateGPT",  # Chat with docs locally
    "oobabooga/text-generation-webui",  # UI for LLMs
    "lucidrains/imagen-pytorch",  # Bleeding edge paper implementations
    "invoke-ai/InvokeAI",  # Professional SD interface
    "comfyanonymous/ComfyUI",  # Node-based SD interface
    "PromtEngineer/localGPT",  # Local RAG implementation
    "logspace-ai/langflow",  # Visual flow builder for LLMs
    "torvalds/linux",
    "systemd/systemd",  # System and service manager
    "neovim/neovim",
    "tmux/tmux",
    "alacritty/alacritty",
    "jesseduffield/lazygit",
    "junegunn/fzf",
    "BurntSushi/ripgrep",
    "sharkdp/fd",  # Fast find alternative
    "starship/starship",  # Cross-shell prompt
    "fish-shell/fish-shell",  # User-friendly shell
    "nushell/nushell",  # Structured data shell
    "dandavison/delta",  # Syntax-highlighting pager for git
    "pallets/flask",  # Classic Python web framework
    "django/django",  # Batteries-included web framework
    "psf/black",  # Uncompromising code formatter
    "requests/requests",
    "tiangolo/fastapi",
    "home-assistant/core",  # Home Automation (Huge community)
    "flutter/flutter",  # Cross-platform UI (Google)
    "facebook/react",  # UI Library (Meta)
    "microsoft/vscode",  # Code Editor (Microsoft)
    "kubernetes/kubernetes",  # Container Orchestration
    "tensorflow/tensorflow",  # ML Framework (Google)
    "ollama/ollama",  # Run LLMs locally (Go) - Extremely high velocity
    "charmbracelet/bubbletea",  # TUI framework (Go)
    "charmbracelet/gum",  # Shell scripting tool
    "atuinsh/atuin",  # Shell history sync (Rust)
    "sharkdp/bat",
    "eza-community/eza",  # Modern ls replacement
    "sxyazi/yazi",  # Blazing fast terminal file manager
    "kovidgoyal/kitty",
    "wez/wezterm",  # Another GPU Terminal (Rust/Lua)
    "casey/just",  # Command runner (Make alternative)
    "aristocratos/btop",  # Resource monitor
    "cantino/mcfly",  # AI shell search
    "ajeetdsouza/zoxide",  # Smarter cd command
    "Significant-Gravitas/AutoGPT",  # Autonomous GPT agents
    "langchain-ai/langchain",  # Building apps with LLMs (Python)
    "run-llama/llama_index",  # Data framework for LLMs
    "vllm-project/vllm",  # High-throughput LLM serving
    "nomic-ai/gpt4all",  # Chat with local LLMs
    "microsoft/DeepSpeed",  # Deep learning optimization
    "facebookresearch/segment-anything",  # Image segmentation
    "openai/whisper",  # Robust Speech Recognition
    "modelscope/modelscope",  # Model-as-a-Service platform
    "binary-husky/gpt_academic",  # GPT for academic research
    "khoj-ai/khoj",  # AI personal assistant
    "sveltejs/svelte",  # Cybernetically enhanced web apps
    "vuejs/core",  # Vue.js 3
    "solidjs/solid",  # React alternative (Signals)
    "withastro/astro",  # Content-focused web framework
    "remix-run/remix",  # Full stack web framework
    "tailwindlabs/tailwindcss",  # Utility-first CSS
    "denoland/deno",  # Secure runtime for JS/TS
    "strapi/strapi",  # Headless CMS
    "grafana/k6",  # Modern load testing
    "puppeteer/puppeteer",  # Headless Chrome Node.js API
    "cypress-io/cypress",  # E2E Testing
    "opentofu/opentofu",  # Open source Terraform fork (Interesting community dynamics)
    "docker/cli",
    "moby/moby",
    "ansible/ansible",
    "prometheus/prometheus",
    "grafana/grafana",
    "traefik/traefik",  # Modern reverse proxy
    "minio/minio",  # High performance object storage
    "cockroachdb/cockroach",  # Distributed SQL database
    "etcd-io/etcd",  # Key-value store for distributed systems
    "ziglang/zig",  # General-purpose programming language
    "nim-lang/Nim",  # Statically typed, expressive language
    "vlang/v",  # Simple, fast, safe, compiled language
    "crystal-lang/crystal",  # Ruby syntax, C performance
    "elixir-lang/elixir",
    "NousResearch/atropos",
]


def get_pr_features(pr, repo_name):
    """
    Extract features from a single pr object
    """
    pr_data = {
        "repo_name": repo_name,
        "pr_number": pr.number,
        "html_url": pr.html_url,
        "state": pr.state,
        "is_draft": pr.draft,
        "merged": pr.merged,
        "title": pr.title,
        "body": pr.body,
    }

    # --- 1. Author Metrics ---
    pr_data["author_association"] = pr.author_association
    if pr.user:
        account_age = (pr.created_at - pr.user.created_at).days
        pr_data["author_account_age_days"] = account_age
    else:
        pr_data["author_account_age_days"] = 0

    # --- 2. Size & Complexity ---
    pr_data["additions"] = pr.additions
    pr_data["deletions"] = pr.deletions
    pr_data["changed_files"] = pr.changed_files
    pr_data["commits_count"] = pr.commits
    pr_data["body_len"] = len(pr.body) if pr.body else 0

    # --- 3. Time Metrics ---
    pr_data["created_day_of_week"] = pr.created_at.weekday()
    pr_data["created_hour"] = pr.created_at.hour

    if pr.merged_at:
        duration = (pr.merged_at - pr.created_at).total_seconds() / 3600
        pr_data["hours_to_merge"] = round(duration, 2)
    else:
        pr_data["hours_to_merge"] = -1

    # --- 4. Community Interaction ---
    pr_data["review_comments_count"] = pr.review_comments
    pr_data["issue_comments_count"] = pr.comments

    try:
        pr_data["requested_reviewers_count"] = len(list(pr.requested_reviewers))
    except Exception:
        pr_data["requested_reviewers_count"] = 0

    # --- 5. Labels & Milestones ---
    pr_data["labels"] = ", ".join([lable.name for lable in pr.labels])
    pr_data["milestone"] = pr.milestone.title if pr.milestone else None

    # --- 6. Branches ---
    pr_data["head_branch"] = pr.head.ref
    pr_data["base_branch"] = pr.base.ref

    # --- 7. File Extensions ---
    extensions = set()
    try:
        files = pr.get_files()
        file_count = 0
        for f in files:
            file_count += 1
            if file_count > MAX_FILES_CHECK:
                break

            filename = f.filename
            if "." in filename:
                ext = filename.split(".")[-1]
                extensions.add(ext)

        pr_data["file_extensions"] = ", ".join(sorted(extensions))
    except Exception as e:
        print(e)
        pr_data["file_extensions"] = ""

    return pr_data


def handle_rate_limit(g):
    """
    Checks rate limit and sleeps if necessary
    """
    rate_limit = g.get_rate_limit().resources.core
    remaining = rate_limit.remaining

    if remaining < 500:
        print(f"API Calls Remaining: {remaining}")

    if remaining < 100:
        print(f"API Calls Remaining: {remaining}")


def main():
    if TOKEN is not None:
        auth = Auth.Token(TOKEN)
        g = Github(auth=auth)
    else:
        print("invalid token")

    total_collected = 0

    for repo_name in TARGET_REPOS:
        print(f"Starting Repository: {repo_name}")

        try:
            repo = g.get_repo(repo_name)
            pulls = repo.get_pulls(state="closed", sort="created", direction="desc")

            repo_data = []
            count = 0
            total_checked = 0
            iterator = iter(pulls)

            while count < PR_LIMIT_PER_REPO:
                try:
                    # Check rate limit every 100 PRs
                    if total_checked % 100 == 0:
                        handle_rate_limit(g)

                    pr = next(iterator)
                    total_checked += 1

                    if not pr.merged:
                        continue

                    print(
                        f"[{repo_name}] {count + 1}/{PR_LIMIT_PER_REPO} - #{pr.number}"
                    )

                    data = get_pr_features(pr, repo_name)
                    repo_data.append(data)
                    count += 1

                except StopIteration:
                    print(f"End of PRs for {repo_name}")
                    break
                except RateLimitExceededException:
                    handle_rate_limit(g)
                    continue
                except Exception as e:
                    if "404" not in str(e):
                        print(f"Skipping PR due to error: {e}")
                    time.sleep(0.5)
                    continue

            if repo_data:
                df = pd.DataFrame(repo_data)
                header_mode = not os.path.exists(OUTPUT_FILE)
                df.to_csv(OUTPUT_FILE, mode="a", header=header_mode, index=False)
                print(f"Saved {len(df)} rows for {repo_name} to {OUTPUT_FILE}")
                total_collected += len(df)

        except Exception as e:
            print(f"Failed to process repo {repo_name}: {e}")
            continue

    print(f"\nJob Complete! Total rows collected: {total_collected}")


if __name__ == "__main__":
    main()
