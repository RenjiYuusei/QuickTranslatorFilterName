/**
 * Tool lọc họ tên nhân vật từ file text
 * Hỗ trợ cho QuickTranslate - TangThuVien
 * Phiên bản: 1.3.5
 * Tác giả: Đoàn Đình Hoàng
 * Liên hệ: daoluc.yy@gmail.com
 * Cập nhật: 04/12/2024
 * !!! CẢNH BÁO !!!
 * Đoạn code bên dưới phần config rất quan trọng,
 * nếu không biết code xin đừng chỉnh sửa vì sẽ gây lỗi tool.
 * Chỉ chỉnh sửa phần config nếu cần thiết.
 */

const fs = require('fs');
const path = require('path');

// Cấu hình - Có thể chỉnh sửa phần này
const config = {
	// File đầu vào chứa danh sách các từ cần lọc
	inputFile: './result_TheoTầnSuất_ViếtHoa.txt',
	// Hoặc result_TheoĐộDài_ViếtHoa.txt ( khuyến khích dùng result_TầnSuất_ViếtHoa.txt hơn)

	// File đầu ra sẽ chứa danh sách tên nhân vật đã lọc
	outputFile: './result_TênNhânVật.txt',

	// File Names.txt chứa danh sách tên đã có
	namesFile: './Names.txt',

	// File log lỗi
	errorLogFile: './error.log',

	// Encoding của file
	encoding: 'utf8',

	// Độ dài tối thiểu và tối đa của từ Hán Việt
	minLength: 2, // Tối thiểu 2 chữ
	maxLength: 3, // Tối Đa 3 chữ (hoặc 4 chữ)

	// Regex blacklist - Đơn giản hóa để dễ chỉnh sửa
	blacklistWords: [
		// Từ lặp lại
		'A A',
		'Ngô Ngô Ngô',
		// Địa danh
		'Hoa Hạ',
		'Long Quốc',

		// Từ tục tĩu
		'Chó Cái',
		'Đĩ Cái',
		'Đĩ',
		'Côn Thịt',
		'Nhũ Căn',
		'Âm Huyệt',
		'Tiểu Huyệt',
		'Nhục Bổng',
		'Dâm Động',
		'Dâm Mị',
		'Nội Xạ',
		'Xuất Tinh',
		'Tiểu Dâm',
		'Nhục Tiện',
		'Nhục Tiện Khí',
		'Âm Đạo',
		'Nhũ Nhục',
		'Nhục Động',
		'Hiếp Dâm',
		'Bắn Tinh',

		// Từ không phải tên người
		'Thôn Phệ',
		'Huynh Đài',
		'Đạo Hữu',
		'Cô Nương',
		'Tẩu Tử',
		'Đại Ca',
		'Đại Lão',
		'Nữ Hiệp',
		'Hắc Nhân',
		'Kê Ba',
		'Tẩy Não',
		'Xúc Thủ',
		'Mỹ Thối',
		'Đại nhân',
		'Hảo Thư',
		'Ngận Khoái',
		'Tòng Tha',
		'Đại Kê',
		// Thêm các từ cần lọc vào đây, mỗi từ đặt trong dấu nháy đơn và phân cách bằng dấu phẩy
	],

	// Danh sách họ hợp lệ - Đơn giản hóa thành mảng để dễ chỉnh sửa
	validFamilyNames: [
		// Họ phổ biến
		'Liễu',
		'Lý',
		'Nguyễn',
		'Trương',
		'Vương',
		'Lưu',
		'Trần',
		'Dương',
		'Triệu',
		'Hoàng',
		'Chu',
		'Ngô',
		'Tôn',
		'Lâm',
		'Tống',
		'Đặng',
		'Hàn',
		'Phùng',
		'Thẩm',
		'Tào',

		// Họ thường gặp
		'Diệp',
		'Ngụy',
		'Tiêu',
		'Trình',
		'Hứa',
		'Đinh',
		'Tô',
		'Đỗ',
		'Phạm',
		'Tạ',
		'Hồ',
		'Từ',
		'Quách',
		'Cố',
		'Nhiếp',
		'Thái',
		'Đào',
		'Bành',
		'Khổng',
		'Văn',

		// Họ ít gặp
		'Nhâm',
		'Phó',
		'Nghiêm',
		'Kiều',
		'Bạch',
		'Cung',
		'Tiết',
		'Kỷ',
		'Thôi',
		'Nhan',
		'Phương',
		'Phù',
		'Doãn',
		'Thi',
		'Hoa',
		'Giả',
		'Tư',
		'Mạc',
		'Lạc',
		'Bùi',

		// Họ hiếm
		'Châu',
		'Đường',
		'Giang',
		'Hạ',
		'La',
		'Lăng',
		'Lục',
		'Mai',
		'Mạnh',
		'Nghê',
		'Sở',
		'Thủy',
		'Thạch',
		'Trác',
		'Trịnh',
		'Yến',
		'Yên',
		'Kế',
		'Tá',
		'Tần',

		// Họ rất hiếm
		'An',
		'Biện',
		'Chung',
		'Đoàn',
		'Hà',
		'Khương',
		'Lê',
		'Lương',
		'Mẫn',
		'Ninh',
		'Đàm',
		'Cảnh',
		'Chiêm',
		'Đan',
		'Đậu',
		'Điền',
		'Đổng',
		'Đới',
		'Hoa',
		'Hoắc',

		// Họ cực hiếm
		'Lãnh',
		'Lôi',
		'Mạch',
		'Mộc',
		'Nhạc',
		'Phi',
		'Phong',
		'Bối',
		'Cốc',
		'Hàn',
		'Cúc',
		'Vân',
		'Mô',
		'Mao',
		'Quan',
		'Sa',
		'Lam',
	],
};

// !!! CẢNH BÁO: KHÔNG CHỈNH SỬA CODE DƯỚI PHẦN NÀY !!!
// Các hàm xử lý chính của tool

// Ghi log lỗi
function logError(error) {
	const timestamp = new Date().toISOString();
	const logMessage = `[${timestamp}] ${error.message}\n`;
	fs.appendFileSync(config.errorLogFile, logMessage);
}

// Đọc file
function readFile(filePath) {
	try {
		if (!fs.existsSync(filePath)) {
			throw new Error(`File không tồn tại: ${filePath}`);
		}
		return fs.readFileSync(filePath, config.encoding);
	} catch (err) {
		logError(err);
		console.error('Lỗi khi đọc file:', err.message);
		process.exit(1);
	}
}

// Ghi file
function writeFile(filePath, content) {
	try {
		const dir = path.dirname(filePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		fs.writeFileSync(filePath, content, config.encoding);
	} catch (err) {
		logError(err);
		console.error('Lỗi khi ghi file:', err.message);
		process.exit(1);
	}
}

// Kiểm tra tên riêng
function isProperName(word) {
	if (!word || typeof word !== 'string') return false;
	const firstChar = word.charAt(0);
	return firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
}

// Kiểm tra độ dài từ
function checkWordLength(word) {
	return word && word.length >= config.minLength && word.length <= config.maxLength;
}

// Kiểm tra họ hợp lệ
function hasValidFamilyName(words) {
	if (!words || !words.length) return false;
	return config.validFamilyNames.includes(words[0]) && words.length > 1;
}

// Kiểm tra từ có trong blacklist không
function isBlacklisted(name) {
	return config.blacklistWords.some(word => name.includes(word));
}

// Đọc danh sách tên đã có từ Names.txt
function getExistingNames() {
	try {
		const namesContent = readFile(config.namesFile);
		const existingNames = new Set();
		const lines = namesContent.split('\n');

		for (const line of lines) {
			const [hanViet, phienAm] = line.split('=').map(s => s?.trim());
			if (hanViet && phienAm) {
				existingNames.add(`${hanViet}=${phienAm}`);
			}
		}

		return existingNames;
	} catch (err) {
		console.log('Không tìm thấy file Names.txt hoặc file rỗng');
		return new Set();
	}
}

// Lọc tên nhân vật
function filterCharacterNames(content) {
	if (!content) return { names: [], stats: {}, nameMap: new Map() };

	const lines = content.split('\n');
	const characterNames = new Set();
	const nameMap = new Map();
	const existingNames = getExistingNames();

	const stats = {
		total: 0,
		filtered: 0,
		validNames: 0,
		blacklisted: 0,
		duplicates: 0,
		existingNames: 0,
	};

	for (const line of lines) {
		stats.total++;
		const trimmedLine = line.trim();

		if (!trimmedLine) {
			stats.filtered++;
			continue;
		}

		const [hanViet, phienAm] = trimmedLine.split('=').map(s => s.trim());
		if (!phienAm || !hanViet) {
			stats.filtered++;
			continue;
		}

		if (existingNames.has(`${hanViet}=${phienAm}`)) {
			stats.existingNames++;
			continue;
		}

		if (isBlacklisted(phienAm)) {
			stats.blacklisted++;
			continue;
		}

		if (!checkWordLength(hanViet)) {
			stats.filtered++;
			continue;
		}

		const words = phienAm.split(' ');

		if (!hasValidFamilyName(words)) {
			stats.filtered++;
			continue;
		}

		const isValidName = words.every(word => isProperName(word));
		if (!isValidName) {
			stats.filtered++;
			continue;
		}

		if (characterNames.has(phienAm)) {
			stats.duplicates++;
			continue;
		}

		characterNames.add(phienAm);
		stats.validNames++;
		nameMap.set(hanViet, phienAm);
	}

	const sortedNames = Array.from(characterNames).sort();

	return {
		names: sortedNames.map(name => ({
			name,
			hanViet: Array.from(nameMap.entries()).find(([_, value]) => value === name)?.[0],
		})),
		stats,
		nameMap,
	};
}

// Xử lý chính
async function main() {
	console.log('Bắt đầu xử lý...');
	console.time('Thời gian xử lý');

	const inputPath = path.resolve(config.inputFile);
	const outputPath = path.resolve(config.outputFile);
	const content = readFile(inputPath);
	const result = filterCharacterNames(content);

	const output = result.names.map(item => `${item.hanViet}=${item.name}`).join('\n');

	writeFile(outputPath, output);

	console.timeEnd('Thời gian xử lý');
	console.log('\nThống kê:');
	console.log(`- Tổng số dòng: ${result.stats.total}`);
	console.log(`- Số dòng đã lọc: ${result.stats.filtered}`);
	console.log(`- Số từ trong blacklist: ${result.stats.blacklisted}`);
	console.log(`- Số tên trùng lặp: ${result.stats.duplicates}`);
	console.log(`- Số tên đã tồn tại trong Names.txt: ${result.stats.existingNames}`);
	console.log(`- Số tên nhân vật hợp lệ: ${result.stats.validNames}`);
	console.log(`- Số tên nhân vật còn lại: ${result.names.length}`);
}

main().catch(err => {
	logError(err);
	console.error('Lỗi:', err.message);
	process.exit(1);
});
