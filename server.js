const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3456;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  next();
});

// ==================== 登录 ====================
app.post("/api/login", async (req, res) => {
  try {
    const { student_id, name, role } = req.body;
    if (role === "admin") {
      if (!name || name.trim() === "") {
        return res.json({ success: false, message: "请输入管理员姓名" });
      }
      const result = await db.query("SELECT * FROM building WHERE admin_id = ?", [student_id]);
      if (result.recordset.length > 0) {
        return res.json({ success: true, role: "admin", user: result.recordset[0] });
      }
    } else {
      const result = await db.query("SELECT * FROM student WHERE student_id = ? AND name = ?", [student_id, name]);
      if (result.recordset.length > 0) {
        return res.json({ success: true, role: "student", user: result.recordset[0] });
      }
    }
    res.json({ success: false, message: "账号或姓名错误" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== 楼栋管理 ====================
app.get("/api/buildings", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM building ORDER BY building_id");
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/buildings", async (req, res) => {
  try {
    const { building_id, building_name, building_type, floor_count, total_rooms, address, admin_id } = req.body;
    await db.query(
      "INSERT INTO building (building_id, building_name, building_type, floor_count, total_rooms, address, admin_id) VALUES (?,?,?,?,?,?,?)",
      [building_id, building_name, building_type, floor_count, total_rooms, address, admin_id]
    );
    res.json({ success: true, message: "添加成功" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/buildings/:id", async (req, res) => {
  try {
    const { building_name, building_type, floor_count, total_rooms, address, admin_id } = req.body;
    await db.query(
      "UPDATE building SET building_name=?, building_type=?, floor_count=?, total_rooms=?, address=?, admin_id=? WHERE building_id=?",
      [building_name, building_type, floor_count, total_rooms, address, admin_id, req.params.id]
    );
    res.json({ success: true, message: "更新成功" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/buildings/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM building WHERE building_id = ?", [req.params.id]);
    res.json({ success: true, message: "删除成功" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== 宿舍管理 ====================
app.get("/api/dormitories", async (req, res) => {
  try {
    const { building_id } = req.query;
    let sql = "SELECT d.*, b.building_name FROM dormitory d LEFT JOIN building b ON d.building_id = b.building_id";
    let params = [];
    if (building_id) {
      sql += " WHERE d.building_id = ?";
      params.push(building_id);
    }
    sql += " ORDER BY d.building_id, d.floor, d.room_number";
    const result = await db.query(sql, params);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/dormitories", async (req, res) => {
  try {
    const { room_id, building_id, floor, room_number, capacity, has_air_conditioner, has_toilet } = req.body;
    await db.query(
      "INSERT INTO dormitory (room_id, building_id, floor, room_number, capacity, has_air_conditioner, has_toilet) VALUES (?,?,?,?,?,?,?)",
      [room_id, building_id, floor, room_number, capacity || 4, has_air_conditioner || 0, has_toilet || 0]
    );
    res.json({ success: true, message: "添加成功" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/dormitories/:id", async (req, res) => {
  try {
    const { building_id, floor, room_number, capacity, status, has_air_conditioner, has_toilet } = req.body;
    await db.query(
      "UPDATE dormitory SET building_id=?, floor=?, room_number=?, capacity=?, status=?, has_air_conditioner=?, has_toilet=? WHERE room_id=?",
      [building_id, floor, room_number, capacity, status, has_air_conditioner, has_toilet, req.params.id]
    );
    res.json({ success: true, message: "更新成功" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/dormitories/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM dormitory WHERE room_id = ?", [req.params.id]);
    res.json({ success: true, message: "删除成功" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== 学生管理 ====================
app.get("/api/students", async (req, res) => {
  try {
    const { dormitory_id, college } = req.query;
    let sql = "SELECT s.*, d.room_number, d.building_id, b.building_name FROM student s LEFT JOIN dormitory d ON s.dormitory_id = d.room_id LEFT JOIN building b ON d.building_id = b.building_id WHERE 1=1";
    let params = [];
    if (dormitory_id) { sql += " AND s.dormitory_id = ?"; params.push(dormitory_id); }
    if (college) { sql += " AND s.college = ?"; params.push(college); }
    sql += " ORDER BY s.student_id";
    const result = await db.query(sql, params);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const { student_id, name, gender, phone, college, class_name, dormitory_id, bed_number, check_in_date } = req.body;
    // 检查床位冲突
    if (dormitory_id && bed_number) {
      var conflictPost = await db.query(
        "SELECT name FROM student WHERE dormitory_id = ? AND bed_number = ? AND status = '在住'",
        [dormitory_id, bed_number]
      );
      if (conflictPost.recordset.length > 0) {
        return res.json({ success: false, message: '床位冲突：' + conflictPost.recordset[0].name + ' 已占用该床位' });
      }
    }

    await db.query(
      "INSERT INTO student (student_id, name, gender, phone, college, class_name, dormitory_id, bed_number, check_in_date, status) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [student_id, name, gender, phone, college, class_name, dormitory_id, bed_number, check_in_date, '在住']
    );
    if (dormitory_id) {
      const dormInfo = await db.query("SELECT d.room_number, b.building_name FROM dormitory d LEFT JOIN building b ON d.building_id = b.building_id WHERE d.room_id = ?", [dormitory_id]);
      const di = dormInfo.recordset[0];
      var reason = '入住到' + (di ? di.building_name + '-' + di.room_number : dormitory_id);
      await db.query(
        "INSERT INTO allocation_record (student_id, room_id, bed_number, allocation_type, allocation_date, operator, reason) VALUES (?,?,?,?,?,?,?)",
        [student_id, dormitory_id, bed_number, '入住', check_in_date, req.body.operator || '系统', reason]
      );
    }
    res.json({ success: true, message: "添加成功" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/students/:id", async (req, res) => {
  try {
    const { name, gender, phone, college, class_name, dormitory_id, bed_number, status, check_in_date, operator } = req.body;
    const old = await db.query("SELECT * FROM student WHERE student_id = ?", [req.params.id]);
    const oldData = old.recordset[0];
    const oldDormitoryId = oldData?.dormitory_id || null;
    const oldStatus = oldData?.status || null;
    const newDormitoryId = dormitory_id || null;

    // 检查床位冲突：同一宿舍同一床位不能有另一个在住学生
    if (newDormitoryId && bed_number && status === '在住') {
      const conflict = await db.query(
        "SELECT student_id, name FROM student WHERE dormitory_id = ? AND bed_number = ? AND status = '在住' AND student_id <> ?",
        [newDormitoryId, bed_number, req.params.id]
      );
      if (conflict.recordset.length > 0) {
        var cname = conflict.recordset[0].name;
        return res.json({ success: false, message: '床位冲突：' + cname + ' 已占用该床位' });
      }
    }

    await db.query(
      "UPDATE student SET name=?, gender=?, phone=?, college=?, class_name=?, dormitory_id=?, bed_number=?, status=?, check_in_date=? WHERE student_id=?",
      [name, gender, phone, college, class_name, newDormitoryId, bed_number, status, check_in_date, req.params.id]
    );

    const dormitoryChanged = newDormitoryId !== oldDormitoryId;
    const isLeaving = (status === '已退宿' || status === '休学');
    const needsRecord = dormitoryChanged || (isLeaving && oldDormitoryId && oldStatus !== status);

    if (needsRecord) {
      var allocType, reason, roomId;

      if (!oldDormitoryId && newDormitoryId) {
        // 原无宿舍，新分配宿舍 → 入住
        allocType = '入住';
        const nd = await db.query("SELECT d.room_number, b.building_name FROM dormitory d LEFT JOIN building b ON d.building_id = b.building_id WHERE d.room_id = ?", [newDormitoryId]);
        const ni2 = nd.recordset[0];
        reason = '入住到' + (ni2 ? ni2.building_name + '-' + ni2.room_number : newDormitoryId);
        roomId = newDormitoryId;
      } else if (oldDormitoryId && (!newDormitoryId || (isLeaving && !dormitoryChanged))) {
        // 原有宿舍，现清空或状态改为退宿/休学
        if (status === '休学') {
          allocType = '休学';
          reason = '休学';
        } else {
          allocType = '退宿';
          reason = '退宿';
        }
        roomId = oldDormitoryId;
      } else {
        // 两宿舍都有但不同 → 调换
        allocType = '调换';
        const oldDorm = await db.query("SELECT d.room_number, b.building_name FROM dormitory d LEFT JOIN building b ON d.building_id = b.building_id WHERE d.room_id = ?", [oldDormitoryId]);
        const newDorm = await db.query("SELECT d.room_number, b.building_name FROM dormitory d LEFT JOIN building b ON d.building_id = b.building_id WHERE d.room_id = ?", [newDormitoryId]);
        const oi = oldDorm.recordset[0];
        const ni = newDorm.recordset[0];
        const oldLabel = oi ? oi.building_name + '-' + oi.room_number : oldDormitoryId;
        const newLabel = ni ? ni.building_name + '-' + ni.room_number : newDormitoryId;
        reason = '从' + oldLabel + '调换至' + newLabel;
        roomId = newDormitoryId;
      }

      await db.query(
        "INSERT INTO allocation_record (student_id, room_id, bed_number, allocation_type, allocation_date, operator, reason) VALUES (?,?,?,?,?,?,?)",
        [req.params.id, roomId, bed_number || oldData?.bed_number || 1, allocType, new Date().toISOString().slice(0,10), operator || '系统', reason]
      );
    }
    res.json({ success: true, message: "更新成功" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete("/api/students/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM student WHERE student_id = ?", [req.params.id]);
    res.json({ success: true, message: "删除成功" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== 报修管理 ====================
app.get("/api/repairs", async (req, res) => {
  try {
    const { student_id, status, room_id } = req.query;
    let sql = "SELECT r.*, s.name AS student_name, d.room_number, b.building_name FROM repair r LEFT JOIN student s ON r.student_id = s.student_id LEFT JOIN dormitory d ON r.room_id = d.room_id LEFT JOIN building b ON d.building_id = b.building_id WHERE 1=1";
    let params = [];
    if (student_id) { sql += " AND r.student_id = ?"; params.push(student_id); }
    if (status) { sql += " AND r.status = ?"; params.push(status); }
    if (room_id) { sql += " AND r.room_id = ?"; params.push(room_id); }
    sql += " ORDER BY r.repair_time DESC";
    const result = await db.query(sql, params);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/repairs", async (req, res) => {
  try {
    const { student_id, room_id, repair_type, description } = req.body;
    await db.query(
      "INSERT INTO repair (student_id, room_id, repair_type, description) VALUES (?,?,?,?)",
      [student_id, room_id, repair_type, description]
    );
    res.json({ success: true, message: "报修提交成功" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/repairs/:id", async (req, res) => {
  try {
    const { status, remark } = req.body;
    if (status === '已完成') {
      await db.query("UPDATE repair SET status=?, remark=?, complete_time=GETDATE() WHERE repair_id=?", [status, remark, req.params.id]);
    } else {
      await db.query("UPDATE repair SET status=?, remark=? WHERE repair_id=?", [status, remark, req.params.id]);
    }
    res.json({ success: true, message: "更新成功" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== 来访管理 ====================
app.get("/api/visitors", async (req, res) => {
  try {
    const { student_id, status } = req.query;
    let sql = "SELECT v.*, s.name AS student_name, d.room_number, b.building_name FROM visitor v LEFT JOIN student s ON v.student_id = s.student_id LEFT JOIN dormitory d ON s.dormitory_id = d.room_id LEFT JOIN building b ON d.building_id = b.building_id WHERE 1=1";
    let params = [];
    if (student_id) { sql += " AND v.student_id = ?"; params.push(student_id); }
    if (status) { sql += " AND v.status = ?"; params.push(status); }
    sql += " ORDER BY v.register_time DESC";
    const result = await db.query(sql, params);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/visitors", async (req, res) => {
  try {
    const { student_id, visitor_name, visitor_phone, visitor_id_card, purpose, visit_date, start_time, end_time } = req.body;
    await db.query(
      "INSERT INTO visitor (student_id, visitor_name, visitor_phone, visitor_id_card, purpose, visit_date, start_time, end_time) VALUES (?,?,?,?,?,?,?,?)",
      [student_id, visitor_name, visitor_phone, visitor_id_card, purpose, visit_date, start_time, end_time]
    );
    res.json({ success: true, message: "来访登记提交成功" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put("/api/visitors/:id", async (req, res) => {
  try {
    const { status } = req.body;
    await db.query("UPDATE visitor SET status=? WHERE visitor_id=?", [status, req.params.id]);
    res.json({ success: true, message: "更新成功" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== 卫生检查 ====================
app.get("/api/health-checks", async (req, res) => {
  try {
    const { room_id } = req.query;
    let sql = "SELECT h.*, d.room_number, b.building_name FROM health_check h LEFT JOIN dormitory d ON h.room_id = d.room_id LEFT JOIN building b ON d.building_id = b.building_id WHERE 1=1";
    let params = [];
    if (room_id) { sql += " AND h.room_id = ?"; params.push(room_id); }
    sql += " ORDER BY h.check_date DESC";
    const result = await db.query(sql, params);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/api/health-checks", async (req, res) => {
  try {
    const { room_id, inspector, check_date, score, grade, comment } = req.body;
    await db.query(
      "INSERT INTO health_check (room_id, inspector, check_date, score, grade, comment) VALUES (?,?,?,?,?,?)",
      [room_id, inspector, check_date, score, grade, comment]
    );
    res.json({ success: true, message: "检查记录添加成功" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== 分配记录 ====================
app.get("/api/allocations", async (req, res) => {
  try {
    const { student_id } = req.query;
    let sql = "SELECT a.*, s.name AS student_name, d.room_number, b.building_name FROM allocation_record a LEFT JOIN student s ON a.student_id = s.student_id LEFT JOIN dormitory d ON a.room_id = d.room_id LEFT JOIN building b ON d.building_id = b.building_id WHERE 1=1";
    let params = [];
    if (student_id) { sql += " AND a.student_id = ?"; params.push(student_id); }
    sql += " ORDER BY a.allocation_date DESC";
    const result = await db.query(sql, params);
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== 入住率统计 ====================
app.get("/api/statistics/occupancy", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT b.building_id, b.building_name, b.building_type, SUM(d.capacity) AS total_capacity, SUM(d.current_occupancy) AS total_occupied, CAST(SUM(d.current_occupancy) * 100.0 / NULLIF(SUM(d.capacity),0) AS DECIMAL(5,2)) AS occupancy_rate FROM building b INNER JOIN dormitory d ON b.building_id = d.building_id GROUP BY b.building_id, b.building_name, b.building_type ORDER BY occupancy_rate DESC"
    );
    res.json({ success: true, data: result.recordset });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== 仪表盘统计 ====================
app.get("/api/statistics/dashboard", async (req, res) => {
  try {
    const totalB = await db.query("SELECT COUNT(*) AS cnt FROM building");
    const totalD = await db.query("SELECT COUNT(*) AS cnt FROM dormitory");
    const totalS = await db.query("SELECT COUNT(*) AS cnt FROM student WHERE status='在住'");
    const pendingR = await db.query("SELECT COUNT(*) AS cnt FROM repair WHERE status IN ('待处理','处理中')");
    const pendingV = await db.query("SELECT COUNT(*) AS cnt FROM visitor WHERE status='待审核'");
    res.json({
      success: true,
      data: {
        buildingCount: totalB.recordset[0].cnt,
        dormitoryCount: totalD.recordset[0].cnt,
        studentCount: totalS.recordset[0].cnt,
        pendingRepairs: pendingR.recordset[0].cnt,
        pendingVisitors: pendingV.recordset[0].cnt,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== SPA路由 ====================
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log("宿舍管理系统已启动: http://localhost:" + PORT);
});
