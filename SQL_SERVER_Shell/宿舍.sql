-- ============================================
-- 宿舍管理系统数据库建表脚本
-- 包含7张表，满足不少于6张表的要求
-- ============================================
CREATE DATABASE DormManagement;
GO

USE DormManagement;
GO
-- 1. 楼栋信息表
CREATE TABLE building (
    building_id VARCHAR(10) NOT NULL,
    building_name VARCHAR(50) NOT NULL,
    building_type VARCHAR(20) NOT NULL CHECK (building_type IN ('男生', '女生', '教职工')),
    floor_count INT NOT NULL,
    total_rooms INT NOT NULL,
    address VARCHAR(100) NULL,
    admin_id VARCHAR(20) NULL,
    CONSTRAINT PK_building PRIMARY KEY (building_id)
);

-- 2. 宿舍房间表
CREATE TABLE dormitory (
    room_id VARCHAR(20) NOT NULL,
    building_id VARCHAR(10) NOT NULL,
    floor INT NOT NULL,
    room_number VARCHAR(10) NOT NULL,
    capacity INT NOT NULL DEFAULT 4,
    current_occupancy INT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT '正常' CHECK (status IN ('正常', '维修', '关闭')),
    has_air_conditioner TINYINT NOT NULL DEFAULT 0,
    has_toilet TINYINT NOT NULL DEFAULT 0,
    CONSTRAINT PK_dormitory PRIMARY KEY (room_id),
    CONSTRAINT FK_dormitory_building FOREIGN KEY (building_id) REFERENCES building(building_id),
    CONSTRAINT CK_current_occupancy CHECK (current_occupancy <= capacity)
);

-- 3. 学生信息表
CREATE TABLE student (
    student_id VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('男', '女')),
    phone VARCHAR(20) NULL,
    college VARCHAR(50) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    dormitory_id VARCHAR(20) NULL,
    bed_number INT NULL,
    check_in_date DATE NULL,
    status VARCHAR(20) NOT NULL DEFAULT '在住' CHECK (status IN ('在住', '已退宿', '休学')),
    CONSTRAINT PK_student PRIMARY KEY (student_id),
    CONSTRAINT FK_student_dormitory FOREIGN KEY (dormitory_id) REFERENCES dormitory(room_id),
    CONSTRAINT CK_bed_number CHECK (bed_number BETWEEN 1 AND 8)
);

-- 4. 报修记录表
CREATE TABLE repair (
    repair_id INT NOT NULL IDENTITY(1,1),
    student_id VARCHAR(20) NOT NULL,
    room_id VARCHAR(20) NOT NULL,
    repair_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    repair_time DATETIME NOT NULL DEFAULT GETDATE(),
    status VARCHAR(20) NOT NULL DEFAULT '待处理' CHECK (status IN ('待处理', '处理中', '已完成', '已评价')),
    complete_time DATETIME NULL,
    remark VARCHAR(200) NULL,
    CONSTRAINT PK_repair PRIMARY KEY (repair_id),
    CONSTRAINT FK_repair_student FOREIGN KEY (student_id) REFERENCES student(student_id),
    CONSTRAINT FK_repair_dormitory FOREIGN KEY (room_id) REFERENCES dormitory(room_id)
);

-- 5. 来访人员登记表
CREATE TABLE visitor (
    visitor_id INT NOT NULL IDENTITY(1,1),
    student_id VARCHAR(20) NOT NULL,
    visitor_name VARCHAR(50) NOT NULL,
    visitor_phone VARCHAR(20) NOT NULL,
    visitor_id_card VARCHAR(20) NOT NULL,
    purpose VARCHAR(100) NOT NULL,
    visit_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT '待审核' CHECK (status IN ('待审核', '已通过', '已拒绝', '已结束')),
    register_time DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT PK_visitor PRIMARY KEY (visitor_id),
    CONSTRAINT FK_visitor_student FOREIGN KEY (student_id) REFERENCES student(student_id),
    CONSTRAINT CK_visit_time CHECK (start_time < end_time)
);

-- 6. 卫生检查记录表
CREATE TABLE health_check (
    check_id INT NOT NULL IDENTITY(1,1),
    room_id VARCHAR(20) NOT NULL,
    inspector VARCHAR(50) NOT NULL,
    check_date DATE NOT NULL,
    score INT NOT NULL,
    grade VARCHAR(10) NOT NULL CHECK (grade IN ('优', '良', '中', '差')),
    comment VARCHAR(200) NULL,
    problem_photo VARCHAR(200) NULL,
    CONSTRAINT PK_health_check PRIMARY KEY (check_id),
    CONSTRAINT FK_health_check_dormitory FOREIGN KEY (room_id) REFERENCES dormitory(room_id),
    CONSTRAINT CK_score CHECK (score BETWEEN 0 AND 100)
);

-- 7. 住宿分配记录表
CREATE TABLE allocation_record (
    allocation_id INT NOT NULL IDENTITY(1,1),
    student_id VARCHAR(20) NOT NULL,
    room_id VARCHAR(20) NOT NULL,
    bed_number INT NOT NULL,
    allocation_type VARCHAR(20) NOT NULL CHECK (allocation_type IN ('入住', '调换', '退宿')),
    allocation_date DATE NOT NULL,
    operator VARCHAR(50) NOT NULL,
    reason VARCHAR(100) NULL,
    CONSTRAINT PK_allocation_record PRIMARY KEY (allocation_id),
    CONSTRAINT FK_allocation_student FOREIGN KEY (student_id) REFERENCES student(student_id),
    CONSTRAINT FK_allocation_dormitory FOREIGN KEY (room_id) REFERENCES dormitory(room_id),
    CONSTRAINT CK_allocation_bed CHECK (bed_number BETWEEN 1 AND 8)
);

-- ============================================
-- 创建索引以提高查询效率
-- ============================================

-- 楼栋名称索引
CREATE INDEX idx_building_name ON building(building_name);

-- 宿舍房间号索引
CREATE INDEX idx_dormitory_room_number ON dormitory(room_number);
CREATE INDEX idx_dormitory_building ON dormitory(building_id);

-- 学生姓名和学院索引
CREATE INDEX idx_student_name ON student(name);
CREATE INDEX idx_student_college ON student(college);
CREATE INDEX idx_student_dormitory ON student(dormitory_id);

-- 报修记录状态和报修时间索引
CREATE INDEX idx_repair_status ON repair(status);
CREATE INDEX idx_repair_time ON repair(repair_time);
CREATE INDEX idx_repair_room ON repair(room_id);

-- 来访登记索引
CREATE INDEX idx_visitor_student ON visitor(student_id);
CREATE INDEX idx_visitor_date ON visitor(visit_date);
CREATE INDEX idx_visitor_status ON visitor(status);

-- 卫生检查索引
CREATE INDEX idx_health_check_room ON health_check(room_id);
CREATE INDEX idx_health_check_date ON health_check(check_date);

insert into building (building_id, building_name, building_type, floor_count, total_rooms, address, admin_id) values
('B001', 'A栋', '男生', 5, 100, '校园东区', 'admin01'),
('B002', 'B栋', '女生', 5, 100, '校园西区', 'admin02'),
('B003', 'C栋', '教职工', 3, 50, '校园南区', 'admin03');

insert into dormitory (room_id, building_id, floor, room_number, capacity, current_occupancy, status, has_air_conditioner, has_toilet) values
('R001', 'B001', 1, '101', 4, 2, '正常', 1, 0),
('R002', 'B001', 1, '102', 4, 3, '正常', 0, 1),
('R003', 'B002', 2, '201', 4, 4, '正常', 1, 1),
('R004', 'B002', 2, '202', 4, 1, '维修', 0, 0),
('R005', 'B003', 1, '301', 2, 2, '正常', 1, 0);

insert into student (student_id, name, gender, phone, college, class_name, dormitory_id, bed_number, check_in_date, status) values
('S001', '张三', '男', '1234567890', '计算机学院', '计科1班', 'R001', 1, '2023-09-01', '在住'),
('S002', '李四', '男', '0987654321', '计算机学院', '计科1班', 'R001', 2, '2023-09-01', '在住'),
('S003', '王五', '女', '1112223333', '外国语学院', '外语1班', 'R003', 1, '2023-09-01', '在住'),
('S004', '赵六', '女', '4445556666', '外国语学院', '外语1班', 'R003', 2, '2023-09-01', '在住'),
('S005', '钱七', '男', NULL, '数学学院', '数院1班', NULL, NULL, NULL, '休学');

select * from building
select * from dormitory
select * from student
select * from repair
select * from visitor
select * from health_check
select * from allocation_record
