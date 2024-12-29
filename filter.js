/**
 * Tool lọc họ tên nhân vật từ file text
 * Hỗ trợ cho QuickTranslate - TangThuVien
 * Phiên bản: 1.5.0
 * Tác giả: Đoàn Đình Hoàng
 * Liên hệ: daoluc.yy@gmail.com
 * Cập nhật: 28/12/2024
 * !!! CẢNH BÁO !!!
 * Đoạn code bên dưới phần config rất quan trọng,
 * nếu không biết code xin đừng chỉnh sửa vì sẽ gây lỗi tool.
 * Chỉ chỉnh sửa phần config nếu cần thiết.
 */

const fs = require('fs');
const path = require('path');

const config = {
	inputFile: 'result_TheoTầnSuất_ViếtHoa.txt',
	outputFile: 'result_TênNhânVật.txt',
	namesFile: 'Names.txt',
	encoding: 'utf8',
	minLength: 2,
	maxLength: 4,
	familyNamesFile: 'data/familyNames.json',
	blacklistFile: 'data/blacklist.json',
};

function logError(error) {
	console.error(`❌ Lỗi: ${error.message}`);
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
	const stats = { total: 0, valid: 0, invalid: 0 };

	for (const line of lines) {
		stats.total++;
		const [hanViet, phienAm] = line
			.trim()
			.split('=')
			.map(s => s?.trim());

		if (!isValidEntry(hanViet, phienAm, existingNames)) {
			stats.invalid++;
			continue;
		}

		characterNames.add(phienAm);
		stats.valid++;
		nameMap.set(hanViet, phienAm);
	}

	return {
		names: Array.from(characterNames)
			.sort()
			.map(name => ({
				name,
				hanViet: Array.from(nameMap.entries()).find(([_, value]) => value === name)?.[0],
			})),
		stats,
		nameMap,
	};
}

function isValidEntry(hanViet, phienAm, existingNames) {
	if (!phienAm || !hanViet || existingNames.has(`${hanViet}=${phienAm}`)) {
		return false;
	}

	if (!checkWordLength(hanViet) || isBlacklisted(phienAm)) {
		return false;
	}

	const words = phienAm.split(' ');
	return hasValidFamilyName(words) && words.every(isProperName);
}

async function main() {
	console.log('🔄 Đang xử lý...');

	try {
		const content = readFile(config.inputFile);
		const result = filterCharacterNames(content);

		const output = result.names.map(item => `${item.hanViet}=${item.name}`).join('\n');

		writeFile(config.outputFile, output);

		console.log('\n📊 Kết quả:');
		console.log(`✓ Tổng số dòng: ${result.stats.total}`);
		console.log(`✓ Hợp lệ: ${result.stats.valid}`);
		console.log(`✓ Không hợp lệ: ${result.stats.invalid}`);
		console.log(`\n✨ Đã lưu kết quả vào: ${config.outputFile}\n`);
	} catch (err) {
		logError(err);
		process.exit(1);
	}
}

main().catch(err => {
	logError(err);
	console.log(`❌ Lỗi: ${err.message}`);
	console.log('💡 Vui lòng kiểm tra file error.log để biết thêm chi tiết.');
	process.exit(1);
});
