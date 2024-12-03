/**
 * Tool lọc họ tên nhân vật từ file text
 * Hỗ trợ cho QuickTranslate - TangThuVien
 * Phiên bản: 1.3.1
 * Tác giả: Đoàn Đình Hoàng
 * Liên hệ: daoluc.yy@gmail.com
 * Cập nhật: 03/12/2024
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
	inputFile: './result_TheoĐộDài_ViếtHoa.txt',
	// Hoặc result_TheoTầnSuất_ViếtHoa.txt ( khuyến khích dùng result_TheoĐộDài_ViếtHoa.txt hơn)

	// File đầu ra sẽ chứa danh sách tên nhân vật đã lọc
	outputFile: './result_TênNhênVật.txt',

	// File Names.txt chứa danh sách tên đã có
	namesFile: './Names.txt',

	// File log lỗi
	errorLogFile: './error.log',

	// Encoding của file
	encoding: 'utf8',

	// Độ dài tối thiểu và tối đa của từ Hán Việt
	minLength: 2, // Tối thiểu 2 chữ
	maxLength: 3, // Tối Đa 3 chữ (hoặc 4 chữ)

	// Từ cần loại bỏ
	blacklist: new Set(['Hoa Hạ', 'Long Quốc', 'Côn Thịt', 'Nhũ Căn', 'Âm Huyệt', 'Hu Hu', 'A A', 'Ba Ba', 'O S', 'B O', 'S S', 'B O S', 'O S S', 'Nga Nga', 'Nga Nga Nga', 'Nga Nga Nga Nga', 'Nga Nga Nga Nga Nga', 'Úc Úc', 'Úc Nga', 'Úc Úc Nga', 'Úc Úc Úc', 'Úc Úc Úc Nga', 'Ân Nga', 'Y Nga', 'Y Úc', 'Tại Hắc', 'Bị Hắc', 'Mị Hắc', 'Tại Đường', 'Tại Tha', 'Tại Giá', 'Trứ Tha', 'Trứ Đường', 'Nhượng Đường', 'Hắc Nhân', 'Kê Ba', 'Tẩy Não', 'Tiểu Huyệt', 'Xúc Thủ', 'Nhục Bổng', 'Mỹ Thối', 'Dâm Động', 'Nội Xạ', 'Xuất Tinh', 'Dâm Mị']),

	// Danh sách họ hợp lệ
	FamilyName: new Set(['Liễu', 'Lý', 'Nguyễn', 'Trương', 'Vương', 'Lưu', 'Trần', 'Dương', 'Triệu', 'Hoàng', 'Chu', 'Ngô', 'Tôn', 'Lâm', 'Tống', 'Đặng', 'Hàn', 'Phùng', 'Thẩm', 'Tào', 'Diệp', 'Ngụy', 'Tiêu', 'Trình', 'Hứa', 'Đinh', 'Tô', 'Đỗ', 'Phạm', 'Tạ', 'Hồ', 'Từ', 'Quách', 'Cố', 'Nhiếp', 'Thái', 'Đào', 'Bành', 'Khổng', 'Văn', 'Nhâm', 'Phó', 'Nghiêm', 'Kiều', 'Bạch', 'Cung', 'Tiết', 'Kỷ', 'Thôi', 'Nhan', 'Phương', 'Phù', 'Doãn', 'Thi', 'Hoa', 'Giả', 'Tư', 'Mạc', 'Lạc', 'Bùi', 'Châu', 'Đường', 'Giang', 'Hạ', 'La', 'Lăng', 'Lục', 'Mai', 'Mạnh', 'Nghê', 'Sở', 'Thủy', 'Thạch', 'Trác', 'Trịnh', 'Yến', 'Yên', 'Kế', 'Tá', 'Tần', 'An', 'Biện', 'Chung', 'Đoàn', 'Hà', 'Khương', 'Lê', 'Lương', 'Mẫn', 'Ninh', 'Đàm', 'Cảnh', 'Chiêm', 'Đan', 'Đậu', 'Điền', 'Đổng', 'Đới', 'Hoa', 'Hoắc', 'Lãnh', 'Lôi', 'Mạch', 'Mộc', 'Nhạc', 'Phi', 'Phong', 'Bối', 'Cốc', 'Hàn', 'Cúc', 'Vân', 'Mô', 'Mao', 'Quan', 'Sa']),
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

	// Kiểm tra chữ cái đầu viết hoa
	const firstChar = word.charAt(0);
	if (firstChar !== firstChar.toUpperCase() || firstChar === firstChar.toLowerCase()) {
		return false;
	}

	return true;
}

// Kiểm tra độ dài từ
function checkWordLength(word) {
	return word && word.length >= config.minLength && word.length <= config.maxLength;
}

// Kiểm tra họ hợp lệ
function hasValidFamilyName(words) {
	if (!words || !words.length) return false;

	// Kiểm tra họ đơn
	if (config.FamilyName.has(words[0])) {
		// Kiểm tra xem có phải là tên đơn lẻ không
		if (words.length === 1) return false;
		return true;
	}

	// Kiểm tra họ kép
	if (words.length >= 2) {
		const doubleFamilyName = words[0] + ' ' + words[1];
		if (config.FamilyName.has(doubleFamilyName)) {
			// Kiểm tra xem có phải là tên đơn lẻ không
			if (words.length === 2) return false;
			return true;
		}
	}

	return false;
}

// Kiểm tra từ có trong blacklist không
function isBlacklisted(name) {
	return Array.from(config.blacklist).some(blacklistedWord => {
		return name === blacklistedWord || name.includes(blacklistedWord);
	});
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
	const characterNames = new Set(); // Dùng Set để lưu tên duy nhất
	const nameMap = new Map(); // Map để lưu tên Trung - Việt
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

		// Kiểm tra xem tên đã tồn tại trong Names.txt chưa
		if (existingNames.has(`${hanViet}=${phienAm}`)) {
			stats.existingNames++;
			continue;
		}

		// Kiểm tra blacklist
		if (isBlacklisted(phienAm)) {
			stats.blacklisted++;
			continue;
		}

		// Kiểm tra độ dài
		if (!checkWordLength(hanViet)) {
			stats.filtered++;
			continue;
		}

		const words = phienAm.split(' ');

		// Kiểm tra có họ hợp lệ không
		if (!hasValidFamilyName(words)) {
			stats.filtered++;
			continue;
		}

		// Kiểm tra tất cả các từ đều là tên riêng
		const isValidName = words.every(word => isProperName(word));
		if (!isValidName) {
			stats.filtered++;
			continue;
		}

		// Kiểm tra trùng lặp
		if (characterNames.has(phienAm)) {
			stats.duplicates++;
			continue;
		}

		// Thêm tên vào Set để loại bỏ trùng lặp
		characterNames.add(phienAm);
		stats.validNames++;

		// Lưu map tên Trung - Việt
		nameMap.set(hanViet, phienAm);
	}

	// Chuyển Set thành mảng và sắp xếp theo alphabet
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

	// Tạo nội dung output chỉ với tên Trung và Việt
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
