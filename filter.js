/**
 * Tool lọc họ tên nhân vật từ file text
 * Hỗ trợ cho QuickTranslate - TangThuVien
 * Phiên bản: 1.4.0
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

const config = {
	inputFile: './result_TheoTầnSuất_ViếtHoa.txt',
	outputFile: './result_TênNhânVật.txt',
	namesFile: './Names.txt',
	errorLogFile: './error.log',
	encoding: 'utf8',
	minLength: 2,
	maxLength: 3,
	familyNamesFile: './data/familyNames.json',
	blacklistFile: './data/blacklist.json',
};

function logError(error) {
	const timestamp = new Date().toISOString();
	const logMessage = `[${timestamp}] ${error.message}\n`;
	fs.appendFileSync(config.errorLogFile, logMessage);
}

function readFile(filePath) {
	try {
		if (!fs.existsSync(filePath)) {
			throw new Error(`File không tồn tại: ${filePath}`);
		}
		return fs.readFileSync(filePath, config.encoding);
	} catch (err) {
		logError(err);
		console.log('❌ Lỗi khi đọc file:', err.message);
		process.exit(1);
	}
}

function writeFile(filePath, content) {
	try {
		const dir = path.dirname(filePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		fs.writeFileSync(filePath, content, config.encoding);
	} catch (err) {
		logError(err);
		console.log('❌ Lỗi khi ghi file:', err.message);
		process.exit(1);
	}
}

function isProperName(word) {
	if (!word || typeof word !== 'string') return false;
	const firstChar = word.charAt(0);
	return firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
}

function checkWordLength(word) {
	return word && word.length >= config.minLength && word.length <= config.maxLength;
}

function loadJsonFile(filePath) {
	try {
		const content = readFile(filePath);
		return JSON.parse(content);
	} catch (err) {
		logError(err);
		console.log(`❌ Lỗi khi đọc file ${filePath}:`, err.message);
		process.exit(1);
	}
}

function hasValidFamilyName(words) {
	if (!words || !words.length) return false;
	const { validFamilyNames } = loadJsonFile(config.familyNamesFile);
	return validFamilyNames.includes(words[0]) && words.length > 1;
}

function isBlacklisted(name) {
	const { blacklistWords } = loadJsonFile(config.blacklistFile);
	return blacklistWords.some(word => name.includes(word));
}

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
		console.log('⚠️ Không tìm thấy file Names.txt hoặc file rỗng');
		return new Set();
	}
}

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

async function main() {
	console.clear();
	console.log('\n');
	console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
	console.log('║                          TOOL LỌC TÊN NHÂN VẬT                           ║');
	console.log('║                             Made by Yuusei                               ║');
	console.log('╚═══════════════════════════════════════════════════════════════════════════╝\n');

	console.log('🚀 Đang khởi động công cụ...');
	console.time('⏱️  Thời gian xử lý');

	const inputPath = path.resolve(config.inputFile);
	const outputPath = path.resolve(config.outputFile);

	console.log('📖 Đang đọc dữ liệu...');
	const content = readFile(inputPath);
	console.log('✅ Đã đọc xong dữ liệu\n');

	console.log('🔍 Đang lọc tên...');
	const result = filterCharacterNames(content);
	console.log('✅ Đã lọc xong\n');

	console.log('💾 Đang lưu kết quả...');
	const output = result.names.map(item => `${item.hanViet}=${item.name}`).join('\n');
	writeFile(outputPath, output);
	console.log('✅ Đã lưu xong\n');

	console.timeEnd('⏱️  Thời gian xử lý');
	console.log('\n📊 Thống kê:');
	console.log(`📝 Tổng số dòng     : ${result.stats.total}`);
	console.log(`🔍 Số dòng đã lọc   : ${result.stats.filtered}`);
	console.log(`⛔ Từ trong blacklist: ${result.stats.blacklisted}`);
	console.log(`🔄 Tên trùng lặp    : ${result.stats.duplicates}`);
	console.log(`📚 Tên đã tồn tại   : ${result.stats.existingNames}`);
	console.log(`✅ Tên hợp lệ       : ${result.stats.validNames}`);
	console.log(`🎯 Tên còn lại      : ${result.names.length}\n`);

	console.log('✨ Hoàn thành! Kết quả đã được lưu vào:');
	console.log(`📁 ${outputPath}\n`);
}

main().catch(err => {
	logError(err);
	console.log(`❌ Lỗi: ${err.message}`);
	console.log('💡 Vui lòng kiểm tra file error.log để biết thêm chi tiết.');
	process.exit(1);
});
