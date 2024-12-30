"""
Tool lọc họ tên nhân vật từ tệp tin văn bản
Hỗ trợ cho QuickTranslate - TangThuVien
Phiên bản: 1.6.0
Tác giả: Đoàn Đình Hoàng
Liên hệ: daoluc.yy@gmail.com
Cập nhật: 29/12/2024
!!! CẢNH BÁO !!!
Đoạn code bên dưới phần config rất quan trọng,
nếu không biết code xin đừng chỉnh sửa vì sẽ gây lỗi tool.
Chỉ chỉnh sửa phần config nếu cần thiết.
"""

import os
import json
import sys
from typing import Dict, List, Set, Tuple, Optional
import time
config = {
    'inputFile': 'result_TheoTầnSuất_ViếtHoa.txt', # File đầu vào
    'outputFile': 'result_TênNhânVật.txt', # File đầu ra
    'namesFile': 'Names.txt', # File tên đã tồn tại
    'encoding': 'utf8', # Định dạng file
    'minLength': 2, # Độ dài tối thiểu của tên
    'maxLength': 3, # Độ dài tối đa của tên (tối đa 3 ký tự)
    'familyNamesFile': 'data/familyNames.json', # File họ tên
    'blacklistFile': 'data/blacklist.json', # File blacklist
}

def log_error(error: Exception) -> None:
    print(f"❌ Lỗi: {str(error)}")

def read_file(file_path: str) -> str:
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File không tồn tại: {file_path}")
        with open(file_path, encoding=config['encoding']) as f:
            return f.read()
    except Exception as err:
        log_error(err)
        print('❌ Lỗi khi đọc file:', str(err))
        sys.exit(1)

def write_file(file_path: str, content: str) -> None:
    try:
        directory = os.path.dirname(file_path)
        if directory and not os.path.exists(directory):
            os.makedirs(directory)
        with open(file_path, 'w', encoding=config['encoding']) as f:
            f.write(content)
    except Exception as err:
        log_error(err)
        print('❌ Lỗi khi ghi file:', str(err))
        sys.exit(1)

def is_proper_name(word: str) -> bool:
    if not word:
        return False
    return word[0].isupper()

def check_word_length(word: str) -> bool:
    return word and config['minLength'] <= len(word) <= config['maxLength']

def load_json_file(file_path: str) -> dict:
    try:
        content = read_file(file_path)
        return json.loads(content)
    except Exception as err:
        log_error(err)
        print(f"❌ Lỗi khi đọc file {file_path}:", str(err))
        sys.exit(1)

def has_valid_family_name(words: List[str]) -> bool:
    if not words:
        return False
    valid_family_names = load_json_file(config['familyNamesFile'])['validFamilyNames']
    return words[0] in valid_family_names and len(words) > 1

def is_blacklisted(name: str) -> bool:
    blacklist_words = load_json_file(config['blacklistFile'])['blacklistWords']
    return any(word in name for word in blacklist_words)

def get_existing_names() -> Set[str]:
    try:
        names_content = read_file(config['namesFile'])
        existing_names = set()
        
        for line in names_content.splitlines():
            parts = line.split('=')
            if len(parts) == 2:
                han_viet, phien_am = map(str.strip, parts)
                if han_viet and phien_am:
                    existing_names.add(f"{han_viet}={phien_am}")
        
        return existing_names
    except Exception:
        print('⚠️ Không tìm thấy file Names.txt hoặc file rỗng')
        return set()

def is_valid_entry(han_viet: str, phien_am: str, existing_names: Set[str]) -> bool:
    if not phien_am or not han_viet or f"{han_viet}={phien_am}" in existing_names:
        return False

    if not check_word_length(han_viet) or is_blacklisted(phien_am):
        return False

    words = phien_am.split()
    
    if len(words) > 3:  # Tên người thường không quá 3 từ
        return False
        
    # Kiểm tra các từ không mong muốn trong tên
    unwanted_words = [
        "Quang Hoạt", "Trượng Phu", "Hồn Viên", "Tuyết Bạch",
        "Cự Nhũ", "Tửu Điếm", "Nhũ Đầu", "Tố Ái", "Hung Tiền",
        "Mỹ Đồn", "Kiều Khu", "Nữ Nhân", "Động Nhân"
    ]
    if any(unwanted in phien_am for unwanted in unwanted_words):
        return False
        
    # Kiểm tra họ hợp lệ và tất cả các từ phải viết hoa
    return has_valid_family_name(words) and all(is_proper_name(word) for word in words)

def filter_character_names(content: str) -> Dict:
    if not content:
        return {'names': [], 'stats': {}, 'nameMap': {}}

    character_names = set()
    name_map = {}
    existing_names = get_existing_names()
    stats = {'total': 0, 'valid': 0, 'invalid': 0}

    for line in content.splitlines():
        stats['total'] += 1
        parts = line.strip().split('=')
        
        if len(parts) != 2:
            stats['invalid'] += 1
            continue
            
        han_viet, phien_am = map(str.strip, parts)

        if not is_valid_entry(han_viet, phien_am, existing_names):
            stats['invalid'] += 1
            continue

        character_names.add(phien_am)
        stats['valid'] += 1
        name_map[han_viet] = phien_am

    names = [{'name': name, 'hanViet': next((k for k, v in name_map.items() if v == name), None)} 
            for name in character_names]
    names.sort(key=lambda x: x['name'])

    return {'names': names, 'stats': stats, 'nameMap': name_map}

def main():
    print('🔄 Đang xử lý...')
    
    start_time = time.time()
    
    try:
        content = read_file(config['inputFile'])
        result = filter_character_names(content)

        output = '\n'.join(f"{item['hanViet']}={item['name']}" for item in result['names'])
        write_file(config['outputFile'], output)

        execution_time = time.time() - start_time

        print('\n📊 Kết quả:')
        print(f"✓ Tổng số dòng: {result['stats']['total']}")
        print(f"✓ Hợp lệ: {result['stats']['valid']}")
        print(f"✓ Không hợp lệ: {result['stats']['invalid']}")
        print(f"\n✨ Đã lưu kết quả vào: {config['outputFile']}\n")
        print(f"⏱️ Thời gian xử lý: {execution_time:.3f} giây\n")

    except Exception as err:
        log_error(err)
        sys.exit(1)

if __name__ == '__main__':
    try:
        main()
    except Exception as err:
        log_error(err)
        print(f"❌ Lỗi: {str(err)}")
        print('💡 Vui lòng kiểm tra file error.log để biết thêm chi tiết.')
        sys.exit(1)
