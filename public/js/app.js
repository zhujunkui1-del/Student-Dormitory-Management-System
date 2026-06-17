// ==================== 全局状态 ====================
let currentUser = null;
let currentRole = 'student';

// ==================== 工具函数 ====================
function $(id) { return document.getElementById(id); }
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  $('toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}
async function api(url, opts = {}) {
  try {
    const config = { headers: { 'Content-Type': 'application/json' }, ...opts };
    if (opts.body && typeof opts.body === 'object') config.body = JSON.stringify(opts.body);
    const res = await fetch(url, config);
    return await res.json();
  } catch (e) {
    return { success: false, message: '网络错误: ' + e.message };
  }
}
function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('zh-CN');
}
function formatDateTime(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('zh-CN');
}

// ==================== 登录 ====================
function switchRole(role) {
  currentRole = role;
  document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  $('loginIdLabel').textContent = role === 'admin' ? '管理员账号' : '学号';
  $('loginId').placeholder = role === 'admin' ? '请输入管理员账号' : '请输入学号';
}
async function doLogin() {
  const id = $('loginId').value.trim();
  const name = $('loginName').value.trim();
  if (!id || !name) {
    $('loginError').style.display = 'block';
    $('loginError').textContent = '请填写完整信息';
    return;
  }
  const res = await api('/api/login', { method: 'POST', body: { student_id: id, name, role: currentRole } });
  if (res.success) {
    currentUser = res.user;
    $('loginPage').style.display = 'none';
    $('appLayout').classList.remove('page-hidden');
    buildSidebar();
    if (currentRole === 'admin') navigate('dashboard');
    else navigate('student-home');
  } else {
    $('loginError').style.display = 'block';
    $('loginError').textContent = res.message || '登录失败';
  }
}
function doLogout() {
  currentUser = null;
  $('loginPage').style.display = '';
  $('appLayout').classList.add('page-hidden');
  $('loginId').value = '';
  $('loginName').value = '';
  $('loginError').style.display = 'none';
}

// ==================== 侧边栏 ====================
function buildSidebar() {
  $('sidebarRole').textContent = currentRole === 'admin' ? '管理员' : '学生';
  const nav = $('sidebarNav');
  if (currentRole === 'admin') {
    nav.innerHTML = `
      <div class="nav-group"><div class="nav-group-title">主面板</div>
        <div class="nav-item active" data-page="dashboard" onclick="navigate('dashboard')"><span class="nav-icon">📊</span> <span>控制台首页</span></div>
      </div>
      <div class="nav-group"><div class="nav-group-title">基础信息</div>
        <div class="nav-item" data-page="buildings" onclick="navigate('buildings')"><span class="nav-icon">🏢</span> <span>楼栋管理</span></div>
        <div class="nav-item" data-page="dormitories" onclick="navigate('dormitories')"><span class="nav-icon">🚪</span> <span>宿舍房间管理</span></div>
      </div>
      <div class="nav-group"><div class="nav-group-title">住宿管理</div>
        <div class="nav-item" data-page="students" onclick="navigate('students')"><span class="nav-icon">👨‍🎓</span> <span>学生住宿管理</span></div>
        <div class="nav-item" data-page="allocations" onclick="navigate('allocations')"><span class="nav-icon">📋</span> <span>分配记录</span></div>
      </div>
      <div class="nav-group"><div class="nav-group-title">业务管理</div>
        <div class="nav-item" data-page="admin-repairs" onclick="navigate('admin-repairs')"><span class="nav-icon">🔧</span> <span>报修管理</span></div>
        <div class="nav-item" data-page="admin-visitors" onclick="navigate('admin-visitors')"><span class="nav-icon">👤</span> <span>来访登记审批</span></div>
        <div class="nav-item" data-page="health-checks" onclick="navigate('health-checks')"><span class="nav-icon">🧹</span> <span>卫生检查管理</span></div>
      </div>
      <div class="nav-group"><div class="nav-group-title">统计报表</div>
        <div class="nav-item" data-page="reports" onclick="navigate('reports')"><span class="nav-icon">📈</span> <span>统计报表</span></div>
      </div>
    `;
  } else {
    nav.innerHTML = `
      <div class="nav-group"><div class="nav-group-title">学生服务</div>
        <div class="nav-item active" data-page="student-home" onclick="navigate('student-home')"><span class="nav-icon">🏠</span> <span>学生主页</span></div>
        <div class="nav-item" data-page="student-dorm" onclick="navigate('student-dorm')"><span class="nav-icon">🛏️</span> <span>宿舍信息查看</span></div>
        <div class="nav-item" data-page="student-repair" onclick="navigate('student-repair')"><span class="nav-icon">🔧</span> <span>报修申请</span></div>
        <div class="nav-item" data-page="student-visitor" onclick="navigate('student-visitor')"><span class="nav-icon">👤</span> <span>来访登记</span></div>
        <div class="nav-item" data-page="student-history" onclick="navigate('student-history')"><span class="nav-icon">📜</span> <span>报修记录查询</span></div>
        <div class="nav-item" data-page="student-visitor-history" onclick="navigate('student-visitor-history')"><span class="nav-icon">📋</span> <span>来访记录查询</span></div>
      </div>
    `;
  }
}

function navigate(page) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navItem = document.querySelector(`[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');
  renderPage(page);
}

function renderPage(page) {
  const mc = $('mainContent');
  switch (page) {
    case 'dashboard': renderDashboard(mc); break;
    case 'buildings': renderBuildings(mc); break;
    case 'dormitories': renderDormitories(mc); break;
    case 'students': renderStudents(mc); break;
    case 'allocations': renderAllocations(mc); break;
    case 'admin-repairs': renderAdminRepairs(mc); break;
    case 'admin-visitors': renderAdminVisitors(mc); break;
    case 'health-checks': renderHealthChecks(mc); break;
    case 'reports': renderReports(mc); break;
    case 'student-home': renderStudentHome(mc); break;
    case 'student-dorm': renderStudentDorm(mc); break;
    case 'student-repair': renderStudentRepair(mc); break;
    case 'student-visitor': renderStudentVisitor(mc); break;
    case 'student-history': renderStudentHistory(mc); break;
    case 'student-visitor-history': renderStudentVisitorHistory(mc); break;
  }
}
// ==================== 管理员页面 ====================
async function renderDashboard(mc) {
  const stats = await api('/api/statistics/dashboard');
  mc.innerHTML = `
    <div class="page-header"><h2>📊 控制台首页</h2><p>数据仪表盘，实时掌握宿舍管理概况</p></div>
    <div class="stats-grid" id="dashStats"></div>
    <div class="card"><div class="card-header"><h3>各楼栋入住率</h3></div><div id="dashOccupancy">加载中...</div></div>
  `;
  if (stats.success) {
    const d = stats.data;
    $('dashStats').innerHTML = `
      <div class="stat-card"><div class="stat-icon blue">🏢</div><div><div class="stat-value">${d.buildingCount}</div><div class="stat-label">楼栋总数</div></div></div>
      <div class="stat-card"><div class="stat-icon green">🚪</div><div><div class="stat-value">${d.dormitoryCount}</div><div class="stat-label">宿舍房间</div></div></div>
      <div class="stat-card"><div class="stat-icon purple">👨‍🎓</div><div><div class="stat-value">${d.studentCount}</div><div class="stat-label">在住学生</div></div></div>
      <div class="stat-card"><div class="stat-icon orange">🔧</div><div><div class="stat-value">${d.pendingRepairs}</div><div class="stat-label">待处理报修</div></div></div>
      <div class="stat-card"><div class="stat-icon red">👤</div><div><div class="stat-value">${d.pendingVisitors}</div><div class="stat-label">待审核来访</div></div></div>
    `;
  }
  const occ = await api('/api/statistics/occupancy');
  if (occ.success && occ.data.length > 0) {
    let html = '<table><thead><tr><th>楼栋编号</th><th>楼栋名称</th><th>类型</th><th>总容量</th><th>已入住</th><th>入住率</th><th>进度条</th></tr></thead><tbody>';
    occ.data.forEach(r => {
      const rate = parseFloat(r.occupancy_rate) || 0;
      const cls = rate > 80 ? 'high' : rate > 50 ? 'mid' : 'low';
      html += `<tr><td>${r.building_id}</td><td>${r.building_name}</td><td>${r.building_type}</td><td>${r.total_capacity}</td><td>${r.total_occupied}</td><td><b>${rate}%</b></td><td><div class="occupancy-bar"><div class="occupancy-fill ${cls}" style="width:${rate}%"></div></div></td></tr>`;
    });
    html += '</tbody></table>';
    $('dashOccupancy').innerHTML = html;
  }
}

async function renderBuildings(mc) {
  mc.innerHTML = `
    <div class="page-header"><h2>🏢 楼栋管理</h2><p>管理学校宿舍楼栋信息</p></div>
    <div class="card">
      <div class="card-header"><h3>楼栋列表</h3><button class="btn btn-primary btn-sm" onclick="showBuildingModal()">+ 添加楼栋</button></div>
      <div class="table-container"><table><thead><tr><th>楼栋编号</th><th>名称</th><th>类型</th><th>楼层数</th><th>房间总数</th><th>地址</th><th>管理员</th><th>操作</th></tr></thead><tbody id="buildingTbody"></tbody></table></div>
    </div>
  `;
  await loadBuildings();
}
async function loadBuildings() {
  const res = await api('/api/buildings');
  if (res.success) {
    window._buildings = res.data;
    $('buildingTbody').innerHTML = res.data.map(b => `
      <tr>
        <td>${b.building_id}</td><td>${b.building_name}</td><td>${b.building_type}</td>
        <td>${b.floor_count}</td><td>${b.total_rooms}</td><td>${b.address || '-'}</td><td>${b.admin_id || '-'}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="editBuildingById('${b.building_id}')">编辑</button>
          <button class="btn btn-danger btn-sm" onclick="deleteBuilding('${b.building_id}')">删除</button>
        </td>
      </tr>
    `).join('');
  }
}
function editBuildingById(id) {
  const data = window._buildings.find(b => b.building_id === id);
  if (data) showBuildingModal(data);
}

function showBuildingModal(data = null) {
  const title = data ? '编辑楼栋' : '添加楼栋';
  const d = data || {};
  $('globalModalContent').innerHTML = `
    <h3>${title}</h3>
    <div class="form-group"><label>楼栋编号</label><input id="fm_building_id" value="${d.building_id || ''}" ${data?'readonly':''}></div>
    <div class="form-group"><label>楼栋名称</label><input id="fm_building_name" value="${d.building_name || ''}"></div>
    <div class="form-group"><label>楼栋类型</label><select id="fm_building_type"><option value="男生" ${d.building_type==='男生'?'selected':''}>男生</option><option value="女生" ${d.building_type==='女生'?'selected':''}>女生</option><option value="教职工" ${d.building_type==='教职工'?'selected':''}>教职工</option></select></div>
    <div class="form-group"><label>楼层数</label><input type="number" id="fm_floor_count" value="${d.floor_count || ''}"></div>
    <div class="form-group"><label>房间总数</label><input type="number" id="fm_total_rooms" value="${d.total_rooms || ''}"></div>
    <div class="form-group"><label>地址</label><input id="fm_address" value="${d.address || ''}"></div>
    <div class="form-group"><label>管理员账号</label><input id="fm_admin_id" value="${d.admin_id || ''}"></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="saveBuilding('${d.building_id || ''}')">保存</button>
    </div>
  `;
  $('globalModal').classList.add('show');
}
async function saveBuilding(id) {
  const body = {
    building_id: $('fm_building_id').value,
    building_name: $('fm_building_name').value,
    building_type: $('fm_building_type').value,
    floor_count: parseInt($('fm_floor_count').value),
    total_rooms: parseInt($('fm_total_rooms').value),
    address: $('fm_address').value,
    admin_id: $('fm_admin_id').value,
  };
  const res = id
    ? await api(`/api/buildings/${id}`, { method: 'PUT', body })
    : await api('/api/buildings', { method: 'POST', body });
  if (res.success) { toast(res.message); closeModal(); await loadBuildings(); }
  else toast(res.message, 'error');
}
async function deleteBuilding(id) {
  if (!confirm('确定删除该楼栋？')) return;
  const res = await api(`/api/buildings/${id}`, { method: 'DELETE' });
  if (res.success) { toast(res.message); await loadBuildings(); }
  else toast(res.message, 'error');
}

function closeModal() { $('globalModal').classList.remove('show'); }
// ==================== 宿舍管理 ====================
async function renderDormitories(mc) {
  const buildings = await api('/api/buildings');
  let bOpts = '<option value="">全部楼栋</option>';
  if (buildings.success) buildings.data.forEach(b => bOpts += `<option value="${b.building_id}">${b.building_name}</option>`);
  mc.innerHTML = `
    <div class="page-header"><h2>🚪 宿舍房间管理</h2><p>管理各楼栋的宿舍房间信息</p></div>
    <div class="card">
      <div class="card-header"><h3>房间列表</h3><button class="btn btn-primary btn-sm" onclick="showDormitoryModal()">+ 添加房间</button></div>
      <div class="search-bar">
        <select id="dormBuildingFilter" onchange="loadDormitories()">${bOpts}</select>
      </div>
      <div class="table-container"><table><thead><tr><th>房间编号</th><th>楼栋</th><th>楼层</th><th>房号</th><th>容量</th><th>已入住</th><th>状态</th><th>空调</th><th>独卫</th><th>操作</th></tr></thead><tbody id="dormitoryTbody"></tbody></table></div>
    </div>
  `;
  await loadDormitories();
}
async function loadDormitories() {
  const bid = $('dormBuildingFilter')?.value || '';
  const query = bid ? `?building_id=${bid}` : '';
  const res = await api(`/api/dormitories${query}`);
  if (res.success) {
    window._dormitories = res.data;
    $('dormitoryTbody').innerHTML = res.data.map(d => `
      <tr>
        <td>${d.room_id}</td><td>${d.building_name}</td><td>${d.floor}</td><td>${d.room_number}</td>
        <td>${d.capacity}</td><td>${d.current_occupancy}</td>
        <td><span class="badge badge-${d.status==='正常'?'success':d.status==='维修'?'warning':'danger'}">${d.status}</span></td>
        <td>${d.has_air_conditioner ? '✅' : '❌'}</td><td>${d.has_toilet ? '✅' : '❌'}</td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="editDormitoryById('${d.room_id}')">编辑</button>
          <button class="btn btn-danger btn-sm" onclick="deleteDormitory('${d.room_id}')">删除</button>
        </td>
      </tr>
    `).join('');
  }
}
function editDormitoryById(id) {
  const data = window._dormitories.find(d => d.room_id === id);
  if (data) showDormitoryModal(data);
}
function showDormitoryModal(data = null) {
  const d = data || {};
  $('globalModalContent').innerHTML = `
    <h3>${data ? '编辑房间' : '添加房间'}</h3>
    <div class="form-group"><label>房间编号</label><input id="fm_room_id" value="${d.room_id || ''}" ${data?'readonly':''}></div>
    <div class="form-group"><label>楼栋编号</label><input id="fm_building_id" value="${d.building_id || ''}"></div>
    <div class="form-group"><label>楼层</label><input type="number" id="fm_floor" value="${d.floor || ''}"></div>
    <div class="form-group"><label>房号</label><input id="fm_room_number" value="${d.room_number || ''}"></div>
    <div class="form-group"><label>容量</label><input type="number" id="fm_capacity" value="${d.capacity || 4}"></div>
    <div class="form-group"><label>状态</label><select id="fm_status"><option value="正常" ${d.status==='正常'?'selected':''}>正常</option><option value="维修" ${d.status==='维修'?'selected':''}>维修</option><option value="关闭" ${d.status==='关闭'?'selected':''}>关闭</option></select></div>
    <div class="form-group"><label>空调</label><select id="fm_ac"><option value="0" ${!d.has_air_conditioner?'selected':''}>无</option><option value="1" ${d.has_air_conditioner?'selected':''}>有</option></select></div>
    <div class="form-group"><label>独卫</label><select id="fm_toilet"><option value="0" ${!d.has_toilet?'selected':''}>无</option><option value="1" ${d.has_toilet?'selected':''}>有</option></select></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="saveDormitory('${d.room_id || ''}')">保存</button>
    </div>
  `;
  $('globalModal').classList.add('show');
}
async function saveDormitory(id) {
  const body = {
    room_id: $('fm_room_id').value, building_id: $('fm_building_id').value,
    floor: parseInt($('fm_floor').value), room_number: $('fm_room_number').value,
    capacity: parseInt($('fm_capacity').value), status: $('fm_status').value,
    has_air_conditioner: parseInt($('fm_ac').value), has_toilet: parseInt($('fm_toilet').value),
  };
  const res = id
    ? await api(`/api/dormitories/${id}`, { method: 'PUT', body })
    : await api('/api/dormitories', { method: 'POST', body });
  if (res.success) { toast(res.message); closeModal(); await loadDormitories(); }
  else toast(res.message, 'error');
}
async function deleteDormitory(id) {
  if (!confirm('确定删除该房间？')) return;
  const res = await api(`/api/dormitories/${id}`, { method: 'DELETE' });
  if (res.success) { toast(res.message); await loadDormitories(); }
  else toast(res.message, 'error');
}

// ==================== 学生管理 ====================
async function renderStudents(mc) {
  const dorms = await api('/api/dormitories');
  let dOpts = '<option value="">全部宿舍</option>';
  if (dorms.success) dorms.data.forEach(d => dOpts += `<option value="${d.room_id}">${d.building_name} ${d.room_number}</option>`);
  mc.innerHTML = `
    <div class="page-header"><h2>👨‍🎓 学生住宿管理</h2><p>管理学生住宿分配、退宿、调换</p></div>
    <div class="card">
      <div class="card-header"><h3>学生列表</h3><button class="btn btn-primary btn-sm" onclick="showStudentModal()">+ 添加学生</button></div>
      <div class="search-bar">
        <select id="studentDormFilter" onchange="loadStudents()">${dOpts}</select>
      </div>
      <div class="table-container"><table><thead><tr><th>学号</th><th>姓名</th><th>性别</th><th>电话</th><th>学院</th><th>班级</th><th>宿舍</th><th>床位</th><th>入住日期</th><th>状态</th><th>操作</th></tr></thead><tbody id="studentTbody"></tbody></table></div>
    </div>
  `;
  await loadStudents();
}
async function loadStudents() {
  const did = $('studentDormFilter')?.value || '';
  const query = did ? `?dormitory_id=${did}` : '';
  const res = await api(`/api/students${query}`);
  if (res.success) {
    window._students = res.data;
    $('studentTbody').innerHTML = res.data.map(s => `
      <tr>
        <td>${s.student_id}</td><td>${s.name}</td><td>${s.gender}</td><td>${s.phone || '-'}</td>
        <td>${s.college}</td><td>${s.class_name}</td>
        <td>${s.building_name ? s.building_name + ' ' + s.room_number : '未分配'}</td>
        <td>${s.bed_number || '-'}</td><td>${formatDate(s.check_in_date)}</td>
        <td><span class="badge badge-${s.status==='在住'?'success':'danger'}">${s.status}</span></td>
        <td>
          <button class="btn btn-outline btn-sm" onclick="editStudentById('${s.student_id}')">编辑</button>
          <button class="btn btn-danger btn-sm" onclick="deleteStudent('${s.student_id}')">删除</button>
        </td>
      </tr>
    `).join('');
  }
}
async function showStudentModal(data = null) {
  const d = data || {};
  const dorms = await api('/api/dormitories');
  let dOpts = '<option value="">不分配</option>';
  if (dorms.success) dorms.data.forEach(r => dOpts += `<option value="${r.room_id}" ${d.dormitory_id===r.room_id?'selected':''}>${r.building_name} ${r.room_number} (${r.current_occupancy}/${r.capacity})</option>`);
  $('globalModalContent').innerHTML = `
    <h3>${data ? '编辑学生' : '添加学生'}</h3>
    <div class="form-group"><label>学号</label><input id="fm_student_id" value="${d.student_id || ''}" ${data?'readonly':''}></div>
    <div class="form-group"><label>姓名</label><input id="fm_name" value="${d.name || ''}"></div>
    <div class="form-group"><label>性别</label><select id="fm_gender"><option value="男" ${d.gender==='男'?'selected':''}>男</option><option value="女" ${d.gender==='女'?'selected':''}>女</option></select></div>
    <div class="form-group"><label>电话</label><input id="fm_phone" value="${d.phone || ''}"></div>
    <div class="form-group"><label>学院</label><input id="fm_college" value="${d.college || ''}"></div>
    <div class="form-group"><label>班级</label><input id="fm_class_name" value="${d.class_name || ''}"></div>
    <div class="form-group"><label>分配宿舍</label><select id="fm_dormitory_id">${dOpts}</select></div>
    <div class="form-group"><label>床位号</label><input type="number" id="fm_bed_number" value="${d.bed_number || ''}"></div>
    <div class="form-group"><label>入住日期</label><input type="date" id="fm_check_in_date" value="${d.check_in_date ? d.check_in_date.toString().slice(0,10) : ''}"></div>
    <div class="form-group"><label>状态</label><select id="fm_status"><option value="在住" ${d.status==='在住'?'selected':''}>在住</option><option value="已退宿" ${d.status==='已退宿'?'selected':''}>已退宿</option><option value="休学" ${d.status==='休学'?'selected':''}>休学</option></select></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="saveStudent('${d.student_id || ''}')">保存</button>
    </div>
  `;
  $('globalModal').classList.add('show');
}
async function saveStudent(id) {
  const sid = $('fm_student_id').value.trim();
  const sname = $('fm_name').value.trim();
  if (!sid) { toast('学号不能为空', 'error'); return; }
  if (!sname) { toast('姓名不能为空', 'error'); return; }
  const body = {
    student_id: sid, name: sname,
    gender: $('fm_gender').value, phone: $('fm_phone').value,
    college: $('fm_college').value, class_name: $('fm_class_name').value,
    dormitory_id: $('fm_dormitory_id').value || null,
    bed_number: parseInt($('fm_bed_number').value) || null,
    check_in_date: $('fm_check_in_date').value || null,
    status: $('fm_status').value, operator: currentUser?.admin_id || '管理员',
  };
  const res = id
    ? await api(`/api/students/${id}`, { method: 'PUT', body })
    : await api('/api/students', { method: 'POST', body });
  if (res.success) { toast(res.message); closeModal(); await loadStudents(); }
  else toast(res.message, 'error');
}
function editStudentById(id) {
  const data = window._students.find(s => s.student_id === id);
  if (data) showStudentModal(data);
}

async function deleteStudent(id) {
  if (!confirm('确定删除该学生？')) return;
  const res = await api(`/api/students/${id}`, { method: 'DELETE' });
  if (res.success) { toast(res.message); await loadStudents(); }
  else toast(res.message, 'error');
}
// ==================== 分配记录 ====================
async function loadAllocations() {
  const bld = $('allocBuildingFilter')?.value || '';
  const rm = $('allocRoomFilter')?.value || '';
  let q = [];
  if(bld) q.push('building_id='+bld);
  if(rm) q.push('room_id='+rm);
  const qs = q.length ? '?'+q.join('&') : '';
  const res = await api('/api/allocations'+qs);
  if (res.success) {
    $('allocTbody').innerHTML = res.data.map(a => `
      <tr>
        <td>${a.allocation_id}</td><td>${a.student_id}</td><td>${a.student_name}</td>
        <td>${a.building_name ? a.building_name + ' ' + a.room_number : '-'}</td>
        <td>${a.bed_number}</td>
        <td><span class="badge badge-${a.allocation_type==='入住'?'success':a.allocation_type==='退宿'?'danger':'info'}">${a.allocation_type}</span></td>
        <td>${formatDate(a.allocation_date)}</td><td>${a.operator}</td><td>${a.reason || '-'}</td>
      </tr>
    `).join('');
  }
}
async function loadBuildingOptions() {
  const res = await api('/api/buildings');
  if(res.success && $('allocBuildingFilter')) {
    res.data.forEach(b => $('allocBuildingFilter').innerHTML += `<option value="${b.building_id}">${b.building_name}</option>`);
  }
}
async function renderAllocations(mc) {
  mc.innerHTML = `
    <div class="page-header"><h2>📋 住宿分配记录</h2><p>追溯学生住宿分配历史</p></div>
    <div class="card">
      <div class="table-container"><table><thead><tr><th>记录ID</th><th>学号</th><th>姓名</th><th>宿舍</th><th>床位</th><th>类型</th><th>日期</th><th>操作人</th><th>原因</th></tr></thead><tbody id="allocTbody"></tbody></table></div>
    </div>
  `;
  await loadBuildingOptions();
  await loadAllocations();
  return;
  const _unused = await api('/api/allocations');
  if (res.success) {
    $('allocTbody').innerHTML = res.data.map(a => `
      <tr>
        <td>${a.allocation_id}</td><td>${a.student_id}</td><td>${a.student_name}</td>
        <td>${a.building_name ? a.building_name + ' ' + a.room_number : '-'}</td>
        <td>${a.bed_number}</td>
        <td><span class="badge badge-${a.allocation_type==='入住'?'success':a.allocation_type==='退宿'?'danger':'info'}">${a.allocation_type}</span></td>
        <td>${formatDate(a.allocation_date)}</td><td>${a.operator}</td><td>${a.reason || '-'}</td>
      </tr>
    `).join('');
  }
}

// ==================== 报修管理 ====================
async function renderAdminRepairs(mc) {
  mc.innerHTML = `
    <div class="page-header"><h2>🔧 报修管理</h2><p>处理学生报修申请，跟踪维修进度</p></div>
    <div class="card">
      <div class="search-bar">
        <select id="repairStatusFilter" onchange="loadAdminRepairs()">
          <option value="">全部状态</option>
          <option value="待处理">待处理</option><option value="处理中">处理中</option>
          <option value="已完成">已完成</option><option value="已评价">已评价</option>
        </select>
      </div>
      <div class="table-container"><table><thead><tr><th>ID</th><th>学号</th><th>姓名</th><th>宿舍</th><th>报修类型</th><th>描述</th><th>报修时间</th><th>状态</th><th>备注</th><th>操作</th></tr></thead><tbody id="adminRepairTbody"></tbody></table></div>
    </div>
  `;
  await loadAdminRepairs();
}
async function loadAdminRepairs() {
  const status = $('repairStatusFilter')?.value || '';
  const query = status ? `?status=${status}` : '';
  const res = await api(`/api/repairs${query}`);
  if (res.success) {
    $('adminRepairTbody').innerHTML = res.data.map(r => `
      <tr>
        <td>${r.repair_id}</td><td>${r.student_id}</td><td>${r.student_name}</td>
        <td>${r.building_name} ${r.room_number}</td><td>${r.repair_type}</td>
        <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.description}</td>
        <td>${formatDateTime(r.repair_time)}</td>
        <td><span class="badge badge-${r.status==='已完成'||r.status==='已评价'?'success':r.status==='处理中'?'warning':'info'}">${r.status}</span></td>
        <td>${r.remark || '-'}</td>
        <td><button class="btn btn-outline btn-sm" onclick="showRepairStatusModal(${r.repair_id},'${r.status}','${(r.remark||'').replace(/'/g,"\\'")}')">更新状态</button></td>
      </tr>
    `).join('');
  }
}
function showRepairStatusModal(id, curStatus, remark) {
  $('globalModalContent').innerHTML = `
    <h3>更新报修状态</h3>
    <div class="form-group"><label>当前状态</label><input value="${curStatus}" readonly></div>
    <div class="form-group"><label>新状态</label>
      <select id="fm_repair_status">
        <option value="待处理" ${curStatus==='待处理'?'selected':''}>待处理</option>
        <option value="处理中" ${curStatus==='处理中'?'selected':''}>处理中</option>
        <option value="已完成" ${curStatus==='已完成'?'selected':''}>已完成</option>
        <option value="已评价" ${curStatus==='已评价'?'selected':''}>已评价</option>
      </select>
    </div>
    <div class="form-group"><label>备注</label><textarea id="fm_repair_remark">${remark}</textarea></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="updateRepairStatus(${id})">保存</button>
    </div>
  `;
  $('globalModal').classList.add('show');
}
async function updateRepairStatus(id) {
  const res = await api(`/api/repairs/${id}`, { method: 'PUT', body: { status: $('fm_repair_status').value, remark: $('fm_repair_remark').value } });
  if (res.success) { toast(res.message); closeModal(); await loadAdminRepairs(); }
  else toast(res.message, 'error');
}

// ==================== 来访审批 ====================
async function renderAdminVisitors(mc) {
  mc.innerHTML = `
    <div class="page-header"><h2>👤 来访登记审批</h2><p>审核学生提交的来访登记申请</p></div>
    <div class="card">
      <div class="search-bar">
        <select id="visitorStatusFilter" onchange="loadAdminVisitors()">
          <option value="">全部状态</option>
          <option value="待审核">待审核</option><option value="已通过">已通过</option>
          <option value="已拒绝">已拒绝</option><option value="已结束">已结束</option>
        </select>
      </div>
      <div class="table-container"><table><thead><tr><th>ID</th><th>学生</th><th>宿舍</th><th>访客姓名</th><th>访客电话</th><th>身份证</th><th>来访目的</th><th>日期</th><th>时间</th><th>状态</th><th>操作</th></tr></thead><tbody id="adminVisitorTbody"></tbody></table></div>
    </div>
  `;
  await loadAdminVisitors();
}
async function loadAdminVisitors() {
  const status = $('visitorStatusFilter')?.value || '';
  const query = status ? `?status=${status}` : '';
  const res = await api(`/api/visitors${query}`);
  if (res.success) {
    $('adminVisitorTbody').innerHTML = res.data.map(v => `
      <tr>
        <td>${v.visitor_id}</td><td>${v.student_name}(${v.student_id})</td>
        <td>${v.building_name} ${v.room_number}</td>
        <td>${v.visitor_name}</td><td>${v.visitor_phone}</td><td>${v.visitor_id_card}</td>
        <td>${v.purpose}</td><td>${formatDate(v.visit_date)}</td>
        <td>${v.start_time}~${v.end_time}</td>
        <td><span class="badge badge-${v.status==='已通过'?'success':v.status==='已拒绝'?'danger':v.status==='待审核'?'warning':'info'}">${v.status}</span></td>
        <td>
          ${v.status==='待审核' ? `<button class="btn btn-success btn-sm" onclick="approveVisitor(${v.visitor_id},'已通过')">通过</button> <button class="btn btn-danger btn-sm" onclick="approveVisitor(${v.visitor_id},'已拒绝')">拒绝</button>` : '-'}
        </td>
      </tr>
    `).join('');
  }
}
async function approveVisitor(id, status) {
  const res = await api(`/api/visitors/${id}`, { method: 'PUT', body: { status } });
  if (res.success) { toast('操作成功'); await loadAdminVisitors(); }
  else toast(res.message, 'error');
}
// ==================== 卫生检查 ====================
async function renderHealthChecks(mc) {
  mc.innerHTML = `
    <div class="page-header"><h2>🧹 卫生检查管理</h2><p>录入和查看宿舍卫生检查记录与评分</p></div>
    <div class="card">
      <div class="card-header"><h3>检查记录</h3><button class="btn btn-primary btn-sm" onclick="showHealthCheckModal()">+ 添加检查记录</button></div>
      <div class="table-container"><table><thead><tr><th>ID</th><th>宿舍</th><th>检查人</th><th>日期</th><th>分数</th><th>等级</th><th>评语</th><th>照片</th></tr></thead><tbody id="healthTbody"></tbody></table></div>
    </div>
  `;
  const res = await api('/api/health-checks');
  if (res.success) {
    $('healthTbody').innerHTML = res.data.map(h => `
      <tr>
        <td>${h.check_id}</td><td>${h.building_name} ${h.room_number}</td><td>${h.inspector}</td>
        <td>${formatDate(h.check_date)}</td>
        <td><b>${h.score}</b></td>
        <td><span class="badge badge-${h.grade==='优'?'success':h.grade==='良'?'info':h.grade==='中'?'warning':'danger'}">${h.grade}</span></td>
        <td>${h.comment || '-'}</td><td>${h.problem_photo ? '<a href="'+h.problem_photo+'" target="_blank">查看</a>' : '-'}</td>
      </tr>
    `).join('');
  }
}
async function showHealthCheckModal() {
  const dorms = await api('/api/dormitories');
  let dOpts = '';
  if (dorms.success) dorms.data.forEach(r => dOpts += `<option value="${r.room_id}">${r.building_name} ${r.room_number}</option>`);
  const today = new Date().toISOString().slice(0, 10);
  $('globalModalContent').innerHTML = `
    <h3>添加卫生检查记录</h3>
    <div class="form-group"><label>宿舍房间</label><select id="fm_hc_room">${dOpts}</select></div>
    <div class="form-group"><label>检查人</label><input id="fm_hc_inspector" value="${currentUser?.admin_id || ''}"></div>
    <div class="form-group"><label>检查日期</label><input type="date" id="fm_hc_date" value="${today}"></div>
    <div class="form-group"><label>分数 (0-100)</label><input type="number" id="fm_hc_score" min="0" max="100"></div>
    <div class="form-group"><label>等级</label><select id="fm_hc_grade"><option value="优">优 (≥90)</option><option value="良">良 (80-89)</option><option value="中">中 (60-79)</option><option value="差">差 (&lt;60)</option></select></div>
    <div class="form-group"><label>评语</label><textarea id="fm_hc_comment"></textarea></div><div class="form-group"><label>问题照片</label><input id="fm_hc_photo" placeholder="照片URL或路径（可选）"></div>
    <div class="modal-actions">
      <button class="btn btn-outline" onclick="closeModal()">取消</button>
      <button class="btn btn-primary" onclick="saveHealthCheck()">保存</button>
    </div>
  `;
  $('globalModal').classList.add('show');
}
async function saveHealthCheck() {
  const body = {
    room_id: $('fm_hc_room').value, inspector: $('fm_hc_inspector').value,
    check_date: $('fm_hc_date').value, score: parseInt($('fm_hc_score').value),
    grade: $('fm_hc_grade').value, comment: $('fm_hc_comment').value, problem_photo: $('fm_hc_photo').value,
  };
  const res = await api('/api/health-checks', { method: 'POST', body });
  if (res.success) { toast(res.message); closeModal(); renderHealthChecks($('mainContent')); }
  else toast(res.message, 'error');
}

// ==================== 统计报表 ====================
async function renderReports(mc) {
  const ocr = await api('/api/statistics/occupancy');
  mc.innerHTML = `
    <div class="page-header"><h2>📈 统计报表</h2><p>各楼栋入住率统计</p></div>
    <div class="card" id="reportOccupancy">加载中...</div>
  `;
  if (ocr.success && ocr.data.length > 0) {
    let html = '<h3 style="margin-bottom:16px">各楼栋入住率统计</h3><table><thead><tr><th>楼栋编号</th><th>楼栋名称</th><th>类型</th><th>总容量</th><th>已入住</th><th>空余床位</th><th>入住率</th><th>进度条</th></tr></thead><tbody>';
    ocr.data.forEach(r => {
      const rate = parseFloat(r.occupancy_rate) || 0;
      const cls = rate > 80 ? 'high' : rate > 50 ? 'mid' : 'low';
      html += `<tr><td>${r.building_id}</td><td>${r.building_name}</td><td>${r.building_type}</td><td>${r.total_capacity}</td><td>${r.total_occupied}</td><td>${r.total_capacity - r.total_occupied}</td><td><b>${rate}%</b></td><td><div class="occupancy-bar"><div class="occupancy-fill ${cls}" style="width:${rate}%"></div></div></td></tr>`;
    });
    html += '</tbody></table>';
    $('reportOccupancy').innerHTML = html;
  }
}

// ==================== 学生页面 ====================
async function renderStudentHome(mc) {
  // 重新获取学生最新信息
  const sRes = await api(`/api/students?dormitory_id=${currentUser.dormitory_id || ''}`);
  let student = currentUser;
  if (sRes.success) {
    const found = sRes.data.find(s => s.student_id === currentUser.student_id);
    if (found) student = found;
  }
  const dormInfo = student.dormitory_id
    ? await api(`/api/dormitories?building_id=${student.building_id || ''}`)
    : { success: false };
  const healthRes = student.dormitory_id
    ? await api(`/api/health-checks?room_id=${student.dormitory_id}`)
    : { success: false };
  let healthHtml = '';
  if (healthRes.success && healthRes.data.length > 0) {
    const h = healthRes.data[0];
    healthHtml = `<div class="card"><h3>最近卫生检查</h3><div class="info-grid"><div class="info-item"><div class="info-label">检查日期</div><div class="info-value">${formatDate(h.check_date)}</div></div><div class="info-item"><div class="info-label">分数</div><div class="info-value">${h.score}分</div></div><div class="info-item"><div class="info-label">等级</div><div class="info-value"><span class="badge badge-${h.grade==='优'?'success':h.grade==='良'?'info':h.grade==='中'?'warning':'danger'}">${h.grade}</span></div></div><div class="info-item"><div class="info-label">评语</div><div class="info-value">${h.comment || '无'}</div></div></div></div>`;
  }
  mc.innerHTML = `
    <div class="page-header"><h2>👋 欢迎，${student.name}</h2><p>学生主页 - 查看个人学籍与宿舍信息</p></div>
    <div class="card"><h3>📋 学籍信息</h3>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">学号</div><div class="info-value">${student.student_id}</div></div>
        <div class="info-item"><div class="info-label">姓名</div><div class="info-value">${student.name}</div></div>
        <div class="info-item"><div class="info-label">性别</div><div class="info-value">${student.gender}</div></div>
        <div class="info-item"><div class="info-label">学院</div><div class="info-value">${student.college}</div></div>
        <div class="info-item"><div class="info-label">班级</div><div class="info-value">${student.class_name}</div></div>
        <div class="info-item"><div class="info-label">电话</div><div class="info-value">${student.phone || '-'}</div></div>
        <div class="info-item"><div class="info-label">入住日期</div><div class="info-value">${formatDate(student.check_in_date)}</div></div>
        <div class="info-item"><div class="info-label">状态</div><div class="info-value"><span class="badge badge-${student.status==='在住'?'success':'danger'}">${student.status}</span></div></div>
      </div>
    </div>
    <div class="card"><h3>🛏️ 宿舍信息</h3>
      ${student.dormitory_id ? `
        <div class="info-grid">
          <div class="info-item"><div class="info-label">楼栋</div><div class="info-value">${student.building_name || '-'}</div></div>
          <div class="info-item"><div class="info-label">房间号</div><div class="info-value">${student.room_number || '-'}</div></div>
          <div class="info-item"><div class="info-label">床位号</div><div class="info-value">${student.bed_number || '-'}号床</div></div>
        </div>
      ` : '<p style="color:var(--text-muted)">暂未分配宿舍</p>'}
    </div>
    ${healthHtml}
  `;
}
// ==================== 学生宿舍信息查看 ====================
async function renderStudentDorm(mc) {
  mc.innerHTML = '<div class="page-header"><h2>🛏️ 宿舍信息查看</h2><p>查看所在宿舍的详细信息</p></div><div id="studentDormContent">加载中...</div>';
  const sRes = await api(`/api/students?dormitory_id=${currentUser.dormitory_id || ''}`);
  let student = currentUser;
  if (sRes.success) {
    const found = sRes.data.find(s => s.student_id === currentUser.student_id);
    if (found) student = found;
  }
  if (!student.dormitory_id) {
    $('studentDormContent').innerHTML = '<div class="card"><p style="color:var(--text-muted)">暂未分配宿舍</p></div>';
    return;
  }
  const dRes = await api(`/api/dormitories?building_id=${student.building_id || ''}`);
  let dorm = null;
  if (dRes.success) dorm = dRes.data.find(d => d.room_id === student.dormitory_id);
  const roommates = sRes.success ? sRes.data.filter(s => s.student_id !== student.student_id) : [];
  $('studentDormContent').innerHTML = `
    <div class="card"><h3>🏠 宿舍基本信息</h3>
      <div class="info-grid">
        <div class="info-item"><div class="info-label">楼栋</div><div class="info-value">${student.building_name || '-'}</div></div>
        <div class="info-item"><div class="info-label">房间号</div><div class="info-value">${student.room_number || '-'}</div></div>
        <div class="info-item"><div class="info-label">楼层</div><div class="info-value">${dorm?.floor || '-'}楼</div></div>
        <div class="info-item"><div class="info-label">容量</div><div class="info-value">${dorm?.capacity || '-'}人</div></div>
        <div class="info-item"><div class="info-label">当前人数</div><div class="info-value">${dorm?.current_occupancy || '-'}人</div></div>
        <div class="info-item"><div class="info-label">空调</div><div class="info-value">${dorm?.has_air_conditioner ? '✅ 有' : '❌ 无'}</div></div>
        <div class="info-item"><div class="info-label">独立卫浴</div><div class="info-value">${dorm?.has_toilet ? '✅ 有' : '❌ 无'}</div></div>
        <div class="info-item"><div class="info-label">状态</div><div class="info-value"><span class="badge badge-${dorm?.status==='正常'?'success':'warning'}">${dorm?.status || '-'}</span></div></div>
        <div class="info-item"><div class="info-label">你的床位</div><div class="info-value">${student.bed_number || '-'}号床</div></div>
      </div>
    </div>
    <div class="card"><h3>👥 室友信息</h3>
      ${roommates.length > 0 ? `
        <div class="table-container"><table><thead><tr><th>床位号</th><th>姓名</th><th>学院</th><th>班级</th><th>电话</th></tr></thead><tbody>
          ${roommates.map(s => `<tr><td>${s.bed_number || '-'}号</td><td>${s.name}</td><td>${s.college}</td><td>${s.class_name}</td><td>${s.phone || '-'}</td></tr>`).join('')}
        </tbody></table></div>
      ` : '<p style="color:var(--text-muted)">暂无室友</p>'}
    </div>
  `;
}

// ==================== 报修申请 ====================
async function renderStudentRepair(mc) {
  mc.innerHTML = `
    <div class="page-header"><h2>🔧 报修申请</h2><p>提交宿舍设施报修</p></div>
    <div class="card">
      <h3 style="margin-bottom:16px">提交报修单</h3>
      <div class="form-group"><label>宿舍房间</label><input value="${currentUser.dormitory_id || '未分配宿舍'}" readonly></div>
      <div class="form-group"><label>报修类型</label>
        <select id="repairType">
          <option value="水电维修">水电维修</option><option value="门窗维修">门窗维修</option>
          <option value="家具维修">家具维修</option><option value="空调维修">空调维修</option>
          <option value="网络故障">网络故障</option><option value="管道疏通">管道疏通</option>
          <option value="墙面粉刷">墙面粉刷</option><option value="其他">其他</option>
        </select>
      </div>
      <div class="form-group"><label>问题描述</label><textarea id="repairDesc" placeholder="请详细描述需要维修的问题..."></textarea></div>
      <button class="btn btn-primary" onclick="submitRepair()">提交报修</button>
    </div>
  `;
}
async function submitRepair() {
  const type = $('repairType').value;
  const desc = $('repairDesc').value.trim();
  if (!desc) { toast('请填写问题描述', 'error'); return; }
  if (!currentUser.dormitory_id) { toast('您尚未分配宿舍，无法报修', 'error'); return; }
  const res = await api('/api/repairs', { method: 'POST', body: { student_id: currentUser.student_id, room_id: currentUser.dormitory_id, repair_type: type, description: desc } });
  if (res.success) { toast('报修提交成功！'); $('repairDesc').value = ''; }
  else toast(res.message, 'error');
}

// ==================== 来访登记 ====================
async function renderStudentVisitor(mc) {
  const today = new Date().toISOString().slice(0, 10);
  mc.innerHTML = `
    <div class="page-header"><h2>👤 来访登记</h2><p>登记来访人员信息，待管理员审批</p></div>
    <div class="card">
      <h3 style="margin-bottom:16px">来访登记表</h3>
      <div class="form-group"><label>访客姓名</label><input id="visitorName"></div>
      <div class="form-group"><label>访客电话</label><input id="visitorPhone"></div>
      <div class="form-group"><label>访客身份证号</label><input id="visitorIdCard"></div>
      <div class="form-group"><label>来访目的</label><input id="visitorPurpose" placeholder="如：探望、送物品等"></div>
      <div class="form-group"><label>来访日期</label><input type="date" id="visitDate" value="${today}"></div>
      <div class="form-group"><label>开始时间</label><input type="time" id="startTime" value="09:00"></div>
      <div class="form-group"><label>结束时间</label><input type="time" id="endTime" value="18:00"></div>
      <button class="btn btn-primary" onclick="submitVisitor()">提交登记</button>
    </div>
  `;
}
async function submitVisitor() {
  const body = {
    student_id: currentUser.student_id,
    visitor_name: $('visitorName').value.trim(),
    visitor_phone: $('visitorPhone').value.trim(),
    visitor_id_card: $('visitorIdCard').value.trim(),
    purpose: $('visitorPurpose').value.trim(),
    visit_date: $('visitDate').value,
    start_time: $('startTime').value,
    end_time: $('endTime').value,
  };
  if (!body.visitor_name || !body.purpose) { toast('请填写必要信息', 'error'); return; }
  if (body.start_time >= body.end_time) { toast('开始时间必须早于结束时间', 'error'); return; }
  const res = await api('/api/visitors', { method: 'POST', body });
  if (res.success) { toast('来访登记提交成功，等待审批！'); $('visitorName').value = ''; $('visitorPhone').value = ''; $('visitorIdCard').value = ''; $('visitorPurpose').value = ''; }
  else toast(res.message, 'error');
}

// ==================== 报修记录查询 ====================
async function renderStudentHistory(mc) {
  mc.innerHTML = `
    <div class="page-header"><h2>📜 报修记录查询</h2><p>查看您的报修历史记录</p></div>
    <div class="card">
      <div class="table-container"><table><thead><tr><th>ID</th><th>报修类型</th><th>描述</th><th>报修时间</th><th>完成时间</th><th>状态</th><th>备注</th></tr></thead><tbody id="repairHistoryTbody"></tbody></table></div>
    </div>
  `;
  const res = await api(`/api/repairs?room_id=${currentUser.dormitory_id}`);
  if (res.success) {
    $('repairHistoryTbody').innerHTML = res.data.map(r => `
      <tr>
        <td>${r.repair_id}</td><td>${r.repair_type}</td>
        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.description}</td>
        <td>${formatDateTime(r.repair_time)}</td><td>${formatDateTime(r.complete_time)}</td>
        <td><span class="badge badge-${r.status==='已完成'||r.status==='已评价'?'success':r.status==='处理中'?'warning':'info'}">${r.status}</span></td>
        <td>${r.remark || '-'}</td>
      </tr>
    `).join('');
    if (res.data.length === 0) $('repairHistoryTbody').innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">暂无报修记录</td></tr>';
  }
}

// ==================== 学生来访记录查询 ====================
async function renderStudentVisitorHistory(mc) {
  mc.innerHTML = `
    <div class="page-header"><h2>📋 来访记录查询</h2><p>查看您的来访申请及审批状态</p></div>
    <div class="card">
      <div class="table-container"><table><thead><tr><th>ID</th><th>访客姓名</th><th>访客电话</th><th>来访目的</th><th>来访日期</th><th>时间</th><th>状态</th><th>登记时间</th></tr></thead><tbody id="studentVisitorTbody"></tbody></table></div>
    </div>
  `;
  const res = await api(`/api/visitors?student_id=${currentUser.student_id}`);
  if (res.success) {
    $('studentVisitorTbody').innerHTML = res.data.map(v => {
      const statusClass = v.status === '已通过' ? 'success' : v.status === '已拒绝' ? 'danger' : v.status === '待审核' ? 'warning' : 'info';
      return `
      <tr>
        <td>${v.visitor_id}</td><td>${v.visitor_name}</td><td>${v.visitor_phone}</td>
        <td>${v.purpose}</td><td>${formatDate(v.visit_date)}</td>
        <td>${v.start_time}~${v.end_time}</td>
        <td><span class="badge badge-${statusClass}">${v.status}</span></td>
        <td>${formatDateTime(v.register_time)}</td>
      </tr>
    `}).join('');
    if (res.data.length === 0) $('studentVisitorTbody').innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--text-muted)">暂无来访记录</td></tr>';
  }
}

// ==================== 初始化 ====================
$('loginId').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
$('loginName').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
$('globalModal').addEventListener('click', e => { if (e.target === $('globalModal')) closeModal(); });
