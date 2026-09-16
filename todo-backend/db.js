const Database = require('better-sqlite3');
const db = new Database('database.db');

db.exec(`
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        current_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )    
`);
//CREATE TABLE: lệnh yêu cầu CSDL tạo 1 bảng mới
//IF NOT EXISTS: kiểm tra CSDL đã có bảng nào tên users chưa
//nếu chưa có thì tạo, nếu có thì bỏ qua không làm gì cả
//users: tên bảng dữ liệu muốn tạo
//PRIMARY KEY: khoá chính của bảng. mỗi người dùng sẽ có 1 id duy nhất như CCCD
//AUTOINCREMENT: tự động tăng giá trị
//UNIQUE: ràng buộc duy nhất. không được phép có 2 người trùng
//NOT NULL: bắt buộc có giá trị, không được để trống
//created_at tên cột lưu thời điểm tài khoản được tạo
//DATETIME: kiểu dữ liệu dạng ngày giờ
//DEFAULT CURRENT_TIMESTAMP: giá trị mặc định. Nếu bạn không truyền giá trị vào cột này khi tạo tài khoản, SQLite sẽ tự động lấy thời gian hiện tại của hệ thống gắn vào đây cho bạn.


db.exec(`
    CREATE TABLE IF NOT EXISTS todos(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        task_name TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        creat_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
`);
//user_id INTEGER NOT NULL: Lưu ID của người dùng sở hữu công việc đó, liên kết với cột id bên bảng users. Bắt buộc phải có user_id thì mới tạo được task (NOT NULL)
//FOREIGN KEY (user_id) REFERENCES users(id): Thiết lập mối quan hệ khóa ngoại, đảm bảo user_id trong bảng todos phải tồn tại trong bảng users.
//ON DELETE CASCADE: Một tính năng cực kỳ thông minh và tiện lợi. Nếu một người dùng bị xóa tài khoản khỏi bảng users, toàn bộ các công việc (todos) do người dùng đó tạo ra sẽ tự động bị xóa sạch theo, giúp cơ sở dữ liệu không bị rác (dữ liệu mồ côi).


module.exports = db;