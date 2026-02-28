"""
Handwritten Notes to PDF Service — extracts handwritten content from PDF pages
using GPT-4o Vision and compiles clean LaTeX output into a typeset PDF.

Pipeline: PDF → images (PyMuPDF) → GPT-4o Vision → LaTeX → pdflatex → PDF
"""

import os
import uuid
import base64
import logging
import subprocess

import fitz  # PyMuPDF — no Poppler dependency needed
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

logger = logging.getLogger(__name__)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def handwritten_notes_to_pdf(pdf_path: str, session_dir: str) -> str:
    """
    Convert handwritten notes in a PDF to a clean, typeset PDF.

    1. Render each PDF page to a PNG via PyMuPDF
    2. Send each image to GPT-4o Vision to extract LaTeX code
    3. Compile the combined LaTeX into a PDF with pdflatex
    """
    if not OPENAI_API_KEY:
        raise ValueError("OpenAI API key not configured. Set OPENAI_API_KEY in .env")

    client = OpenAI(api_key=OPENAI_API_KEY)

    # --- Step 1: PDF → Images (PyMuPDF) ---
    image_paths = _pdf_to_images(pdf_path, session_dir)

    # --- Step 2: Images → LaTeX via GPT-4o Vision ---
    latex_sections = []
    for idx, img_path in enumerate(image_paths):
        latex_code = _extract_latex_from_image(client, img_path, idx + 1)
        latex_sections.append(latex_code)
        logger.info(f"Extracted LaTeX from page {idx + 1}/{len(image_paths)}")

    # --- Step 3: Compile LaTeX → PDF ---
    output_path = _compile_latex_to_pdf(latex_sections, session_dir)

    file_size = os.path.getsize(output_path)
    logger.info(
        f"Handwritten notes PDF created: {output_path} "
        f"({file_size:,} bytes, {len(image_paths)} pages processed)"
    )
    return output_path


def _pdf_to_images(pdf_path: str, session_dir: str) -> list[str]:
    """Render every PDF page to a high-res PNG using PyMuPDF."""
    try:
        doc = fitz.open(pdf_path)
    except Exception as exc:
        logger.error(f"Failed to open PDF: {exc}")
        raise ValueError(f"Could not open PDF: {exc}") from exc

    if len(doc) == 0:
        raise ValueError("The PDF has no pages.")

    image_paths = []
    for page_num in range(len(doc)):
        page = doc[page_num]
        pix = page.get_pixmap(dpi=300)
        img_path = os.path.join(session_dir, f"page_{page_num}.png")
        pix.save(img_path)
        image_paths.append(img_path)

    doc.close()
    logger.info(f"Converted PDF to {len(image_paths)} page image(s)")
    return image_paths


def _extract_latex_from_image(client: OpenAI, image_path: str, page_num: int) -> str:
    """Send a single page image to GPT-4o Vision and extract LaTeX code."""
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    prompt = (
        "You are an expert at reading handwritten notes and converting them to LaTeX. "
        "Examine this image of handwritten notes carefully. "
        "Extract ALL text, mathematical equations, diagrams descriptions, and content. "
        "Output ONLY the LaTeX body content (no \\documentclass, no \\begin{document}, "
        "no \\end{document}). "
        "Use appropriate LaTeX commands for:\n"
        "- Mathematical equations (use $ for inline, $$ or \\[ \\] for display)\n"
        "- Section headings (\\section, \\subsection) if structure is visible\n"
        "- Lists (itemize/enumerate) where appropriate\n"
        "- Tables if any tabular data is present\n"
        "- Bold/italic for emphasized text\n"
        "If you cannot read something clearly, make your best attempt and add a "
        "\\textcolor{red}{[unclear]} marker.\n"
        "Do NOT wrap your output in ```latex``` code fences. Output raw LaTeX only."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/png;base64,{image_data}",
                                "detail": "high",
                            },
                        },
                    ],
                }
            ],
            max_tokens=4096,
            temperature=0.1,
        )
        latex_content = response.choices[0].message.content.strip()

        # Strip code fences if GPT includes them despite instructions
        if latex_content.startswith("```"):
            lines = latex_content.split("\n")
            lines = [l for l in lines if not l.strip().startswith("```")]
            latex_content = "\n".join(lines)

        return latex_content

    except Exception as exc:
        logger.error(f"GPT-4o Vision failed for page {page_num}: {exc}")
        return (
            f"\\textbf{{Page {page_num}: Could not extract content.}} "
            f"\\textit{{{str(exc)[:100]}}}"
        )


def _compile_latex_to_pdf(latex_sections: list, session_dir: str) -> str:
    """Combine LaTeX sections into a full document and compile to PDF."""
    import shutil

    if shutil.which("pdflatex") is None:
        raise ValueError(
            "pdflatex is not installed. Please install MiKTeX "
            "(https://miktex.org/download) and restart the server."
        )

    output_filename = f"{uuid.uuid4().hex}_typeset"

    try:
        return _compile_with_pylatex(latex_sections, session_dir, output_filename)
    except Exception as exc:
        logger.warning(f"PyLaTeX compilation failed: {exc}, trying raw pdflatex")
        return _compile_with_raw_latex(latex_sections, session_dir, output_filename)


def _compile_with_pylatex(latex_sections: list, session_dir: str, output_filename: str) -> str:
    """Compile using PyLaTeX library."""
    from pylatex import Document, NoEscape, Package

    doc = Document(
        documentclass="article",
        document_options=["12pt", "a4paper"],
    )

    doc.packages.append(Package("amsmath"))
    doc.packages.append(Package("amssymb"))
    doc.packages.append(Package("amsfonts"))
    doc.packages.append(Package("graphicx"))
    doc.packages.append(Package("xcolor"))
    doc.packages.append(Package("geometry", options=["margin=1in"]))
    doc.packages.append(Package("inputenc", options=["utf8"]))

    for idx, section_latex in enumerate(latex_sections):
        if idx > 0:
            doc.append(NoEscape(r"\newpage"))
        doc.append(NoEscape(section_latex))

    output_path_base = os.path.join(session_dir, output_filename)
    doc.generate_pdf(output_path_base, clean_tex=False, compiler="pdflatex")

    return output_path_base + ".pdf"


def _compile_with_raw_latex(latex_sections: list, session_dir: str, output_filename: str) -> str:
    """Fallback: write .tex file and call pdflatex directly."""
    tex_content = (
        r"\documentclass[12pt,a4paper]{article}" "\n"
        r"\usepackage[utf8]{inputenc}" "\n"
        r"\usepackage{amsmath,amssymb,amsfonts}" "\n"
        r"\usepackage{graphicx}" "\n"
        r"\usepackage{xcolor}" "\n"
        r"\usepackage[margin=1in]{geometry}" "\n"
        r"\begin{document}" "\n"
    )

    for idx, section_latex in enumerate(latex_sections):
        if idx > 0:
            tex_content += r"\newpage" + "\n"
        tex_content += section_latex + "\n\n"

    tex_content += r"\end{document}"

    tex_path = os.path.join(session_dir, f"{output_filename}.tex")
    with open(tex_path, "w", encoding="utf-8") as f:
        f.write(tex_content)

    for _ in range(2):
        result = subprocess.run(
            ["pdflatex", "-interaction=nonstopmode", "-output-directory", session_dir, tex_path],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if result.returncode != 0:
            logger.warning(f"pdflatex warnings/errors: {result.stderr[:500]}")

    pdf_path = os.path.join(session_dir, f"{output_filename}.pdf")
    if not os.path.exists(pdf_path):
        raise ValueError(
            "LaTeX compilation failed. The handwritten content may contain "
            "syntax that could not be converted to valid LaTeX."
        )

    return pdf_path
