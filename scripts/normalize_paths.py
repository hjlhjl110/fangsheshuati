import json
import re
import os

SRC = os.path.join("data", "questions.json")

def normalize_opt(s: str) -> str:
    s = s.replace("\\", "/")
    m = re.search(r"(?:public/)?images/xray/[^\s\"]+", s)
    if not m:
        m2 = re.search(r"/images/xray/[^\s\"]+", s)
        if not m2:
            return s
        m = m2
    full = m.group(0)
    fname = full.split("/")[-1]
    norm = f"/images/xray/{fname}"
    return re.sub(r"(?:public/)?images/xray/[^\s\"]+|/images/xray/[^\s\"]+", norm, s)

def main():
    with open(SRC, "r", encoding="utf-8") as f:
        data = json.load(f)
    for q in data:
        opts = q.get("options") or []
        q["options"] = [normalize_opt(o) for o in opts]
        ip = q.get("imagePath", "")
        if ip:
            ip = ip.replace("\\", "/")
            if "public/images/xray/" in ip:
                ip = "/images/xray/" + ip.split("/")[-1]
            q["imagePath"] = ip
    with open(SRC, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("UPDATED", SRC)

if __name__ == "__main__":
    main()

