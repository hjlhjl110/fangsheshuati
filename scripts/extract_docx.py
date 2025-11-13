import os
import re
import json
import argparse
from uuid import uuid4
import mammoth
from bs4 import BeautifulSoup

def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)

def convert_docx_to_html(input_path: str, image_dir: str) -> str:
    ensure_dir(image_dir)
    def image_converter(image):
        name = f"qimg_{uuid4().hex}.png"
        out_path = os.path.join(image_dir, name)
        with image.open() as img_file:
            with open(out_path, "wb") as f:
                f.write(img_file.read())
        return {"src": name}
    with open(input_path, "rb") as docx_file:
        result = mammoth.convert_to_html(docx_file, convert_image=mammoth.images.inline(image_converter))
        return result.value

def is_question_start(text: str) -> bool:
    t = text.strip()
    if not t:
        return False
    if re.match(r"^(第\s*\d+\s*题)\s*", t):
        return True
    if re.match(r"^\d+\s*[\.、)]\s*", t):
        return True
    return False

def is_option_line(text: str) -> bool:
    return re.match(r"^[A-Ha-h][\.、)\s]", text.strip()) is not None

def extract_answer(text: str) -> str:
    m = re.search(r"答案[：:】]\s*([A-Ha-h]+)", text)
    if m:
        return m.group(1).upper()
    m2 = re.search(r"\(([A-Ha-h]{1,8})\)$", text.strip())
    if m2:
        return m2.group(1).upper()
    m3 = re.search(r"\（\s*([A-Ha-h])\s*\）", text)
    if m3:
        return m3.group(1).upper()
    return ""

def extract_explanation(text: str) -> str:
    m = re.search(r"(解析|说明|理由)[：:]\s*(.+)$", text)
    if m:
        return m.group(2).strip()
    return ""

def clean_brackets_in_question(text: str) -> str:
    t = re.sub(r"\（[^\）]*\）", "", text)
    t = re.sub(r"\([^)]*\)", "", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t

def split_inline_options(text: str) -> list:
    parts = []
    s = text.strip()
    for m in re.finditer(r"([A-Ha-h])[、\.\)]\s*([^A-Ha-h]+)(?=\s+[A-Ha-h][、\.\)]|$)", s):
        label = m.group(1)
        content = m.group(2).strip()
        parts.append(f"{label}、{content}")
    return parts

def parse_html_to_questions(html: str, image_dir: str) -> list:
    soup = BeautifulSoup(html, "html.parser")
    questions = []
    current = None
    last_option_idx = None
    web_prefix = "/" + image_dir.replace("\\", "/").replace("public/", "")
    for el in soup.find_all(["p", "li", "img"]):
        if el.name == "img":
            if current is not None:
                src = el.get("src", "").strip()
                if src:
                    path = f"{web_prefix}/{src}"
                    if last_option_idx is not None and 0 <= last_option_idx < len(current["options"]):
                        prev = current["options"][last_option_idx].strip()
                        sep = " " if prev else ""
                        current["options"][last_option_idx] = f"{prev}{sep}{path}"
                    else:
                        current.setdefault("images", []).append(path)
            continue
        text = el.get_text(" ", strip=True)
        if not text:
            continue
        if is_question_start(text):
            if current:
                questions.append(current)
            current = {"question": text, "options": [], "answer": "", "explanation": "", "images": []}
            last_option_idx = None
            a = extract_answer(text)
            if a:
                current["answer"] = a
            current["question"] = clean_brackets_in_question(current["question"])
            continue
        if current is None:
            continue
        if is_option_line(text):
            inline_opts = split_inline_options(text)
            if len(inline_opts) > 1:
                current["options"].extend(inline_opts)
                last_option_idx = len(current["options"]) - 1
            else:
                current["options"].append(text)
                last_option_idx = len(current["options"]) - 1
            continue
        inline_opts = split_inline_options(text)
        if inline_opts:
            current["options"].extend(inline_opts)
            last_option_idx = len(current["options"]) - 1
            continue
        a2 = extract_answer(text)
        if a2 and not current.get("answer"):
            current["answer"] = a2
            continue
        e = extract_explanation(text)
        if e:
            current["explanation"] = e
            continue
        if len(current["question"]) < 10:
            current["question"] = current["question"] + " " + clean_brackets_in_question(text)
    if current:
        questions.append(current)
    normalized = []
    for idx, q in enumerate(questions, start=1):
        has_image = len(q.get("images", [])) > 0
        image_path = q["images"][0].replace("\\", "/") if has_image else ""
        normalized.append({
            "id": idx,
            "question": q["question"],
            "options": q["options"] or [],
            "answer": q.get("answer", ""),
            "explanation": q.get("explanation", ""),
            "hasImage": has_image,
            "imagePath": image_path
        })
    return normalized

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--out-json", required=True)
    parser.add_argument("--out-images", required=True)
    args = parser.parse_args()
    ensure_dir(os.path.dirname(args.out_json))
    ensure_dir(args.out_images)
    html = convert_docx_to_html(args.input, args.out_images)
    data = parse_html_to_questions(html, args.out_images)
    with open(args.out_json, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"OUTPUT_JSON={args.out_json}")
    print(f"OUTPUT_IMAGES_DIR={args.out_images}")

if __name__ == "__main__":
    main()
