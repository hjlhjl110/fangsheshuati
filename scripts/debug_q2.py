import mammoth
from bs4 import BeautifulSoup

def main():
    path = r"C:\Users\hjlhj\Desktop\fangshefanghushuati\fangsheshuati\医用X射线诊断与介入放射学.docx"
    with open(path, 'rb') as f:
        html = mammoth.convert_to_html(f).value
    soup = BeautifulSoup(html, 'html.parser')
    els = list(soup.find_all(['p','li','img']))
    idx2 = None
    for i, el in enumerate(els):
        t = el.get_text(' ', strip=True) if el.name!='img' else ''
        if t.startswith('2、') or t.startswith('2.') or t.startswith('2)'):
            idx2 = i
            break
    print('FOUND_IDX', idx2)
    if idx2 is None:
        return
    for j in range(idx2, min(len(els), idx2+20)):
        el = els[j]
        if el.name == 'img':
            print(f'{j-idx2:02d}: IMG src={el.get("src")}')
        else:
            txt = el.get_text(' ', strip=True)
            print(f'{j-idx2:02d}: {el.name} text={txt}')

if __name__ == '__main__':
    main()

