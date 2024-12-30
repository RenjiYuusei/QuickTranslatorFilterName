/**
 * Tool lọc họ tên nhân vật từ tệp tin văn bản
 * Hỗ trợ cho QuickTranslate - TangThuVien
 * Phiên bản: 1.6.0
 * Tác giả: Đoàn Đình Hoàng
 * Liên hệ: daoluc.yy@gmail.com
 * Cập nhật: 29/12/2024
 * !!! CẢNH BÁO !!!
 * Đoạn code bên dưới phần config rất quan trọng,
 * nếu không biết code xin đừng chỉnh sửa vì sẽ gây lỗi tool.
 * Chỉ chỉnh sửa phần config nếu cần thiết.
 */

const fs = require('fs');
const path = require('path');
const startTime = Date.now();
const runtime = typeof Bun !== 'undefined' ? 'Bun' : 'Node.js';

const config = {
	inputFile: 'result_TheoTầnSuất_ViếtHoa.txt', // File đầu vào
	outputFile: 'result_TênNhânVật.txt', // File đầu ra
	namesFile: 'Names.txt', // File tên đã tồn tại
	encoding: 'utf8', // Định dạng file
	minLength: 2, // Độ dài tối thiểu của tên
	maxLength: 3, // Độ dài tối đa của tên (tối đa 3 ký tự)
	familyNamesFile: 'data/familyNames.json', // File họ tên
	blacklistFile: 'data/blacklist.json', // File blacklist
};

async function readFile(filePath) {
	try {
		if (!fs.existsSync(filePath)) {
			throw new Error(`File không tồn tại: ${filePath}`);
		}

		const content = fs.readFileSync(filePath, config.encoding);
		return content;
	} catch (err) {
		logError(err);
		console.log('❌ Lỗi khi đọc file:', err.message);
		process.exit(1);
	}
}

async function readJsonFile(filePath) {
	try {
		if (!fs.existsSync(filePath)) {
			throw new Error(`File không tồn tại: ${filePath}`);
		}

		const content = fs.readFileSync(filePath, config.encoding);
		return JSON.parse(content);
	} catch (err) {
		logError(err);
		console.log(`❌ Lỗi khi đọc file ${filePath}:`, err.message);
		process.exit(1);
	}
}

async function writeFile(filePath, content) {
	try {
		const dir = path.dirname(filePath);
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
		fs.writeFileSync(filePath, content, config.encoding);
	} catch (err) {
		logError(err);
		console.log('❌ Lỗi khi ghi file:', err.message);
	}
}

function filter_character_names(content) {
	if (!content || typeof content !== 'string') {
		throw new Error('Dữ liệu đầu vào không hợp lệ');
	}

	// Đọc blacklist
	let blacklist = [];
	try {
		const blacklistData = fs.readFileSync(config.blacklistFile, config.encoding);
		const blacklistJson = JSON.parse(blacklistData);
		blacklist = blacklistJson.blacklistWords || [];
	} catch (err) {
		console.log('⚠️ Không thể đọc blacklist, tiếp tục với danh sách trống');
	}

	const lines = content.split('\n');
	const names = [];
	const stats = { total: 0, valid: 0, invalid: 0 };

	// Đọc Names.txt nếu tồn tại
	let existingNames = new Set();
	try {
		if (fs.existsSync(config.namesFile)) {
			const namesContent = fs.readFileSync(config.namesFile, config.encoding);
			if (namesContent.trim()) {
				existingNames = new Set(
					namesContent.split('\n').map(line => {
						const parts = line.split('=');
						return parts[0]?.trim() || '';
					})
				);
			} else {
				console.log('⚠️ File Names.txt rỗng');
			}
		} else {
			console.log('⚠️ Không tìm thấy file Names.txt hoặc file rỗng');
		}
	} catch (err) {
		console.log('⚠️ Lỗi khi đọc Names.txt:', err.message);
	}

	for (const line of lines) {
		stats.total++;
		const parts = line.split('=');
		if (parts.length !== 2) {
			stats.invalid++;
			continue;
		}

		const hanViet = parts[0].trim();
		const name = parts[1].trim();

		// Kiểm tra điều kiện
		if (!hanViet || !name || name.length < config.minLength || name.length > config.maxLength || blacklist.some(word => name.includes(word)) || existingNames.has(hanViet)) {
			stats.invalid++;
			continue;
		}

		names.push({ hanViet, name });
		stats.valid++;
	}

	return { names, stats };
}

function logError(err) {
	console.error('🔥 Lỗi:', err);
}

async function main() {
	console.log(`🚀 Đang chạy với: ${runtime}`);
	console.log('🔄 Đang xử lý...');

	try {
		const content = await readFile(config.inputFile);
		const result = filter_character_names(content);

		const output = result.names.map(item => `${item.hanViet}=${item.name}`).join('\n');
		await writeFile(config.outputFile, output);

		const endTime = Date.now();
		const executionTime = (endTime - startTime) / 1000;

		console.log('\n📊 Kết quả:');
		console.log(`✓ Tổng số dòng: ${result.stats.total}`);
		console.log(`✓ Hợp lệ: ${result.stats.valid}`);
		console.log(`✓ Không hợp lệ: ${result.stats.invalid}`);
		console.log(`\n✨ Đã lưu kết quả vào: ${config.outputFile}`);
		console.log(`⏱️ Thời gian xử lý: ${executionTime.toFixed(3)} giây\n`);
	} catch (err) {
		logError(err);
		console.log(`❌ Lỗi: ${err.message}`);
		process.exit(1);
	}
}

main().catch(err => {
	logError(err);
	console.log(`❌ Lỗi: ${err.message}`);
	process.exit(1);
});
