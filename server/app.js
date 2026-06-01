const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const initSqlJs = require('sql.js')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = 3000
const SECRET = 'inventory-secret-2026'
const DB_FILE = path.join(__dirname, 'inventory.db')

let db = null

app.use(cors())
app.use(express.json())

const ok = (res, data) => res.json({ code: 200, data: data ?? null, msg: 'success' })
const fail = (res, code, msg) => res.status(code).json({ code, msg })

app.get('/api/health', (req, res) => ok(res, { status: 'ok' }))

const auth = (req, res, next) => {
  const t = req.headers.authorization?.split(' ')[1]
  if (!t) return fail(res, 401, '未登录')
  try {
    req.user = jwt.verify(t, SECRET)
    next()
  } catch {
    return fail(res, 401, 'token无效')
  }
}

// 将 undefined/null 转为 null（sql.js 不接受 undefined）
function safe(v) {
  return v === undefined ? null : v
}
function safeArr(arr) {
  return (arr || []).map(safe)
}

function Q(sql, p) {
  try {
    const s = db.prepare(sql)
    if (p && p.length) s.bind(safeArr(p))
    const r = []
    while (s.step()) r.push(s.getAsObject())
    s.free()
    return r
  } catch (e) {
    console.error('Q:', e.message, sql)
    return []
  }
}
function Q1(sql, p) {
  return Q(sql, p)[0] || null
}
function R(sql, p) {
  try {
    db.run(sql, safeArr(p))
    save()
  } catch (e) {
    console.error('R:', e.message, sql)
  }
}
function save() {
  try {
    fs.writeFileSync(DB_FILE, Buffer.from(db.export()))
  } catch {}
}

// ========== 初始化 ==========
async function init() {
  const SQL = await initSqlJs()
  if (fs.existsSync(DB_FILE)) {
    try {
      db = new SQL.Database(fs.readFileSync(DB_FILE))
    } catch {
      db = new SQL.Database()
    }
  } else {
    db = new SQL.Database()
  }

  const tables = [
    `CREATE TABLE IF NOT EXISTS shops(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,code TEXT UNIQUE,address TEXT,phone TEXT,status TEXT DEFAULT '1')`,
    `CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT UNIQUE,password TEXT,email TEXT,phone TEXT,roles TEXT DEFAULT '[]',buttons TEXT DEFAULT '[]',shop_id INTEGER)`,
    `CREATE TABLE IF NOT EXISTS customers(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,contact TEXT,phone TEXT,email TEXT,address TEXT,user_id INTEGER,shop_id INTEGER,status TEXT DEFAULT '1')`,
    `CREATE TABLE IF NOT EXISTS categories(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,parent_id INTEGER,sort INTEGER DEFAULT 0,status TEXT DEFAULT '1')`,
    `CREATE TABLE IF NOT EXISTS warehouses(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,location TEXT,shop_id INTEGER,status TEXT DEFAULT '1')`,
    `CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,code TEXT,category_id INTEGER,warehouse_id INTEGER,shop_id INTEGER,unit TEXT,price REAL DEFAULT 0,cost REAL DEFAULT 0,stock INTEGER DEFAULT 0,min_stock INTEGER DEFAULT 0,description TEXT,status TEXT DEFAULT '1',created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS product_prices(id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER,price_name TEXT,price REAL DEFAULT 0,is_default INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS unit_conversions(id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER,from_unit TEXT,to_unit TEXT,conversion_rate REAL DEFAULT 1,price REAL DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS purchase_orders(id INTEGER PRIMARY KEY AUTOINCREMENT,order_no TEXT UNIQUE,customer_id INTEGER,shop_id INTEGER,user_id INTEGER,total_amount REAL DEFAULT 0,total_quantity INTEGER DEFAULT 0,status TEXT DEFAULT 'pending',remark TEXT,operator TEXT,salesperson TEXT,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS purchase_items(id INTEGER PRIMARY KEY AUTOINCREMENT,order_id INTEGER,product_id INTEGER,warehouse_id INTEGER,quantity INTEGER DEFAULT 0,unit TEXT,price REAL DEFAULT 0,amount REAL DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS sales_orders(id INTEGER PRIMARY KEY AUTOINCREMENT,order_no TEXT UNIQUE,customer_id INTEGER,shop_id INTEGER,user_id INTEGER,total_amount REAL DEFAULT 0,total_quantity INTEGER DEFAULT 0,status TEXT DEFAULT 'pending',remark TEXT,operator TEXT,salesperson TEXT,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS sales_items(id INTEGER PRIMARY KEY AUTOINCREMENT,order_id INTEGER,product_id INTEGER,warehouse_id INTEGER,quantity INTEGER DEFAULT 0,unit TEXT,price REAL DEFAULT 0,amount REAL DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS inventory_logs(id INTEGER PRIMARY KEY AUTOINCREMENT,product_id INTEGER,shop_id INTEGER,type TEXT,quantity INTEGER DEFAULT 0,before_stock INTEGER DEFAULT 0,after_stock INTEGER DEFAULT 0,reason TEXT,operator_id INTEGER,created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS units(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,symbol TEXT)`
  ]
  tables.forEach((t) => {
    try {
      db.run(t)
    } catch (e) {
      console.error('Table error:', e.message)
    }
  })

  const cnt = Q1('SELECT COUNT(*) as c FROM users')
  if (!cnt || cnt.c === 0) seed()
  console.log('DB ready')
}

function seed() {
  console.log('Seeding...')
  const h = bcrypt.hashSync('123456', 10)

  // 店铺
  R('INSERT INTO shops(name,code,address,phone,status) VALUES(?,?,?,?,?)', [
    '总店',
    'SHOP001',
    '北京市朝阳区',
    '010-12345678',
    '1'
  ])
  R('INSERT INTO shops(name,code,address,phone,status) VALUES(?,?,?,?,?)', [
    '分店',
    'SHOP002',
    '上海市浦东新区',
    '021-87654321',
    '1'
  ])

  // 用户
  R(
    'INSERT INTO users(username,password,email,phone,roles,buttons,shop_id) VALUES(?,?,?,?,?,?,?)',
    [
      'admin',
      h,
      'admin@example.com',
      '13800000001',
      JSON.stringify(['R_SUPER']),
      JSON.stringify(['add', 'edit', 'delete', 'export', 'print']),
      1
    ]
  )
  R(
    'INSERT INTO users(username,password,email,phone,roles,buttons,shop_id) VALUES(?,?,?,?,?,?,?)',
    [
      'user',
      h,
      'user@example.com',
      '13800000002',
      JSON.stringify(['R_ADMIN']),
      JSON.stringify(['add', 'edit', 'export']),
      2
    ]
  )

  // 单位
  ;[
    ['个', '个'],
    ['台', '台'],
    ['箱', '箱'],
    ['包', '包'],
    ['瓶', '瓶'],
    ['盒', '盒'],
    ['件', '件'],
    ['套', '套'],
    ['提', '提']
  ].forEach((u) => R('INSERT INTO units(name,symbol) VALUES(?,?)', u))

  // 仓库
  ;[
    ['主仓库', '北京朝阳区', 1],
    ['东区分仓', '北京通州区', 1],
    ['上海分仓', '上海浦东区', 2]
  ].forEach((w) => R('INSERT INTO warehouses(name,location,shop_id) VALUES(?,?,?)', w))

  // 分类
  ;[
    [1, '电子产品', null, 1],
    [2, '办公用品', null, 2],
    [3, '食品饮料', null, 3],
    [11, '手机', 1, 1],
    [12, '笔记本', 1, 2],
    [14, '配件', 1, 3],
    [21, '纸张', 2, 1],
    [22, '笔类', 2, 2]
  ].forEach((c) => R('INSERT INTO categories(id,name,parent_id,sort) VALUES(?,?,?,?)', c))

  // 客户
  ;[
    ['北京科技', '张三', '13800001001', 'z@bj.com', '北京海淀', 1, 1],
    ['上海办公', '王五', '13800001003', 'w@sh.com', '上海浦东', 2, 2],
    ['广州食品', '赵六', '13800001004', 'z@gz.com', '广州天河', 1, 1]
  ].forEach((c) =>
    R(
      'INSERT INTO customers(name,contact,phone,email,address,user_id,shop_id) VALUES(?,?,?,?,?,?,?)',
      c
    )
  )

  // 商品
  ;[
    ['iPhone 15 Pro', 'P001', 11, 1, 1, '台', 8999, 6500, 150, 20, '手机', '1'],
    ['MacBook Pro', 'P002', 12, 1, 1, '台', 14999, 11000, 80, 10, '笔记本', '1'],
    ['A4纸', 'P005', 21, 1, 1, '箱', 89, 55, 200, 30, '纸张', '1'],
    ['中性笔', 'P006', 22, 2, 1, '支', 3, 1, 1000, 200, '笔', '1'],
    ['iPhone', 'P001-2', 11, 1, 2, '台', 8999, 6500, 100, 20, '手机', '1']
  ].forEach((p) =>
    R(
      'INSERT INTO products(name,code,category_id,warehouse_id,shop_id,unit,price,cost,stock,min_stock,description,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
      p
    )
  )

  // 商品价格
  ;[
    [1, '零售价', 8999, 1],
    [1, '批发价', 8500, 0],
    [2, '零售价', 14999, 1],
    [2, '批发价', 14000, 0]
  ].forEach((p) =>
    R('INSERT INTO product_prices(product_id,price_name,price,is_default) VALUES(?,?,?,?)', p)
  )

  console.log('Seeded')
}

// ========== 店铺 ==========
app.get('/api/shops', auth, (req, res) => ok(res, Q('SELECT * FROM shops')))
app.get('/api/shops/all', auth, (req, res) => ok(res, Q('SELECT * FROM shops')))
app.post('/api/shops', auth, (req, res) => {
  const { name, code, address, phone, status } = req.body
  R('INSERT INTO shops(name,code,address,phone,status) VALUES(?,?,?,?,?)', [
    name,
    code,
    address,
    phone,
    status || '1'
  ])
  ok(res, null, '添加成功')
})
app.put('/api/shops/:id', auth, (req, res) => {
  const { name, code, address, phone, status } = req.body
  R('UPDATE shops SET name=?,code=?,address=?,phone=?,status=? WHERE id=?', [
    name,
    code,
    address,
    phone,
    status,
    +req.params.id
  ])
  ok(res, null, '更新成功')
})
app.delete('/api/shops/:id', auth, (req, res) => {
  R('DELETE FROM shops WHERE id=?', [+req.params.id])
  ok(res, null, '删除成功')
})

// ========== 认证 ==========
app.post('/api/auth/login', (req, res) => {
  const { userName, password } = req.body
  const u = Q1('SELECT * FROM users WHERE username=?', [userName])
  if (!u || !bcrypt.compareSync(password, u.password)) return fail(res, 400, '用户名或密码错误')
  const tk = jwt.sign(
    { userId: u.id, username: u.username, shopId: u.shop_id, roles: JSON.parse(u.roles || '[]') },
    SECRET,
    { expiresIn: '7d' }
  )
  const shop = u.shop_id ? Q1('SELECT name FROM shops WHERE id=?', [u.shop_id]) : null
  ok(res, {
    token: tk,
    refreshToken: tk,
    shopId: u.shop_id,
    shopName: shop ? shop.name : '总系统',
    isSuperAdmin: JSON.parse(u.roles || '[]').includes('R_SUPER')
  })
})

app.get('/api/auth/userInfo', auth, (req, res) => {
  const u = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  if (!u) return fail(res, 404, '用户不存在')
  const shop = u.shop_id ? Q1('SELECT name FROM shops WHERE id=?', [u.shop_id]) : null
  ok(res, {
    userId: u.id,
    userName: u.username,
    email: u.email || '',
    avatar: '',
    roles: JSON.parse(u.roles || '[]'),
    buttons: JSON.parse(u.buttons || '[]'),
    shopId: u.shop_id,
    shopName: shop ? shop.name : '总系统'
  })
})

app.put('/api/auth/profile', auth, (req, res) => {
  R('UPDATE users SET email=? WHERE id=?', [req.body.email, req.user.userId])
  ok(res, null, '更新成功')
})

app.put('/api/auth/password', auth, (req, res) => {
  const { oldPassword, newPassword } = req.body
  const u = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  if (!u || !bcrypt.compareSync(oldPassword, u.password)) return fail(res, 400, '当前密码错误')
  R('UPDATE users SET password=? WHERE id=?', [bcrypt.hashSync(newPassword, 10), req.user.userId])
  ok(res, null, '密码修改成功')
})

app.get('/api/auth/users', auth, (req, res) => {
  const users = Q('SELECT u.*,s.name as shop_name FROM users u LEFT JOIN shops s ON u.shop_id=s.id')
  ok(
    res,
    users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      phone: u.phone,
      roles: JSON.parse(u.roles || '[]'),
      buttons: JSON.parse(u.buttons || '[]'),
      shop_id: u.shop_id,
      shopName: u.shop_name || '总系统'
    }))
  )
})

app.post('/api/auth/users', auth, (req, res) => {
  const { username, password, email, phone, roles, buttons, shopId } = req.body
  if (Q1('SELECT * FROM users WHERE username=?', [username])) return fail(res, 400, '用户名已存在')
  R(
    'INSERT INTO users(username,password,email,phone,roles,buttons,shop_id) VALUES(?,?,?,?,?,?,?)',
    [
      username,
      bcrypt.hashSync(password || '123456', 10),
      email || '',
      phone || '',
      JSON.stringify(roles || ['R_ADMIN']),
      JSON.stringify(buttons || ['add', 'edit', 'export']),
      shopId || null
    ]
  )
  ok(res, null, '添加成功')
})

app.put('/api/auth/users/:id', auth, (req, res) => {
  const { email, phone, roles, buttons, shopId } = req.body
  if (email !== undefined) R('UPDATE users SET email=? WHERE id=?', [email, +req.params.id])
  if (phone !== undefined) R('UPDATE users SET phone=? WHERE id=?', [phone, +req.params.id])
  if (roles !== undefined)
    R('UPDATE users SET roles=? WHERE id=?', [JSON.stringify(roles), +req.params.id])
  if (buttons !== undefined)
    R('UPDATE users SET buttons=? WHERE id=?', [JSON.stringify(buttons), +req.params.id])
  if (shopId !== undefined) R('UPDATE users SET shop_id=? WHERE id=?', [shopId, +req.params.id])
  ok(res, null, '更新成功')
})

app.put('/api/auth/users/:id/password', auth, (req, res) => {
  const me = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  if (!JSON.parse(me?.roles || '[]').includes('R_SUPER')) return fail(res, 403, '无权限')
  R('UPDATE users SET password=? WHERE id=?', [
    bcrypt.hashSync(req.body.newPassword, 10),
    +req.params.id
  ])
  ok(res, null, '密码修改成功')
})

app.delete('/api/auth/users/:id', auth, (req, res) => {
  const u = Q1('SELECT username FROM users WHERE id=?', [+req.params.id])
  if (u && (u.username === 'admin' || u.username === 'user'))
    return fail(res, 400, '不能删除默认用户')
  R('DELETE FROM users WHERE id=?', [+req.params.id])
  ok(res, null, '删除成功')
})

// ========== 客户 ==========
app.get('/api/customers', auth, (req, res) => {
  const { name, contact, status, shopId, current = 1, size = 10 } = req.query
  let w = 'WHERE 1=1',
    p = []
  const me = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  const isSuper = JSON.parse(me?.roles || '[]').includes('R_SUPER')
  if (!isSuper && req.user.shopId) {
    w += ' AND c.shop_id=?'
    p.push(req.user.shopId)
  } else if (shopId) {
    w += ' AND c.shop_id=?'
    p.push(+shopId)
  }
  if (name) {
    w += ' AND c.name LIKE ?'
    p.push('%' + name + '%')
  }
  if (contact) {
    w += ' AND c.contact LIKE ?'
    p.push('%' + contact + '%')
  }
  if (status) {
    w += ' AND c.status=?'
    p.push(status)
  }
  const t = Q1('SELECT COUNT(*) as c FROM customers c ' + w, p)
  const r = Q(
    'SELECT c.*,s.name as shop_name FROM customers c LEFT JOIN shops s ON c.shop_id=s.id ' +
      w +
      ' ORDER BY c.id DESC LIMIT ? OFFSET ?',
    [...p, +size, (+current - 1) * +size]
  )
  ok(res, {
    records: r.map((x) => ({ ...x, shopName: x.shop_name })),
    current: +current,
    size: +size,
    total: t ? t.c : 0
  })
})

app.get('/api/customers/all', auth, (req, res) => {
  const me = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  const isSuper = JSON.parse(me?.roles || '[]').includes('R_SUPER')
  ok(
    res,
    isSuper
      ? Q('SELECT * FROM customers')
      : Q('SELECT * FROM customers WHERE shop_id=?', [req.user.shopId])
  )
})

app.post('/api/customers', auth, (req, res) => {
  const { name, contact, phone, email, address, status } = req.body
  R(
    'INSERT INTO customers(name,contact,phone,email,address,user_id,shop_id,status) VALUES(?,?,?,?,?,?,?,?)',
    [
      name,
      contact || '',
      phone || '',
      email || '',
      address || '',
      req.user.userId,
      req.user.shopId,
      status || '1'
    ]
  )
  ok(res, null, '添加成功')
})

app.put('/api/customers/:id', auth, (req, res) => {
  const { name, contact, phone, email, address, status } = req.body
  R('UPDATE customers SET name=?,contact=?,phone=?,email=?,address=?,status=? WHERE id=?', [
    name,
    contact || '',
    phone || '',
    email || '',
    address || '',
    status,
    +req.params.id
  ])
  ok(res, null, '更新成功')
})

app.delete('/api/customers/:id', auth, (req, res) => {
  R('DELETE FROM customers WHERE id=?', [+req.params.id])
  ok(res, null, '删除成功')
})

// ========== 商品 ==========
app.get('/api/products', auth, (req, res) => {
  const { name, code, categoryId, warehouseId, shopId, status, current = 1, size = 10 } = req.query
  let w = 'WHERE 1=1',
    p = []
  const me = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  const isSuper = JSON.parse(me?.roles || '[]').includes('R_SUPER')
  if (!isSuper && req.user.shopId) {
    w += ' AND p.shop_id=?'
    p.push(req.user.shopId)
  } else if (shopId) {
    w += ' AND p.shop_id=?'
    p.push(+shopId)
  }
  if (name) {
    w += ' AND p.name LIKE ?'
    p.push('%' + name + '%')
  }
  if (code) {
    w += ' AND p.code LIKE ?'
    p.push('%' + code + '%')
  }
  if (categoryId) {
    w += ' AND p.category_id=?'
    p.push(+categoryId)
  }
  if (warehouseId) {
    w += ' AND p.warehouse_id=?'
    p.push(+warehouseId)
  }
  if (status) {
    w += ' AND p.status=?'
    p.push(status)
  }
  const t = Q1('SELECT COUNT(*) as c FROM products p ' + w, p)
  const r = Q(
    'SELECT p.*,c.name as categoryName,w.name as warehouseName FROM products p LEFT JOIN categories c ON p.category_id=c.id LEFT JOIN warehouses w ON p.warehouse_id=w.id ' +
      w +
      ' ORDER BY p.id DESC LIMIT ? OFFSET ?',
    [...p, +size, (+current - 1) * +size]
  )
  const res2 = r.map((x) => {
    const pr = Q('SELECT * FROM product_prices WHERE product_id=?', [x.id])
    const cv = Q('SELECT * FROM unit_conversions WHERE product_id=?', [x.id])
    return {
      ...x,
      categoryId: x.category_id,
      warehouseId: x.warehouse_id,
      shopId: x.shop_id,
      minStock: x.min_stock,
      prices: pr,
      unitConversions: cv
    }
  })
  ok(res, { records: res2, current: +current, size: +size, total: t ? t.c : 0 })
})

app.get('/api/products/all', auth, (req, res) => {
  const me = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  const isSuper = JSON.parse(me?.roles || '[]').includes('R_SUPER')
  const r = isSuper
    ? Q(
        'SELECT p.*,c.name as categoryName,w.name as warehouseName FROM products p LEFT JOIN categories c ON p.category_id=c.id LEFT JOIN warehouses w ON p.warehouse_id=w.id'
      )
    : Q(
        'SELECT p.*,c.name as categoryName,w.name as warehouseName FROM products p LEFT JOIN categories c ON p.category_id=c.id LEFT JOIN warehouses w ON p.warehouse_id=w.id WHERE p.shop_id=?',
        [req.user.shopId]
      )
  ok(
    res,
    r.map((x) => ({
      ...x,
      categoryId: x.category_id,
      warehouseId: x.warehouse_id,
      shopId: x.shop_id,
      minStock: x.min_stock
    }))
  )
})

app.post('/api/products', auth, (req, res) => {
  const {
    name,
    code,
    categoryId,
    warehouseId,
    shopId,
    unit,
    price,
    cost,
    stock,
    minStock,
    description,
    status,
    prices,
    unitConversions
  } = req.body
  const sid = shopId || req.user.shopId
  if (Q1('SELECT * FROM products WHERE code=? AND shop_id=?', [code, sid]))
    return fail(res, 400, '商品编码已存在')
  R(
    'INSERT INTO products(name,code,category_id,warehouse_id,shop_id,unit,price,cost,stock,min_stock,description,status) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
    [
      name,
      code,
      categoryId || null,
      warehouseId || null,
      sid,
      unit || '',
      price || 0,
      cost || 0,
      stock || 0,
      minStock || 0,
      description || '',
      status || '1'
    ]
  )
  const p = Q1('SELECT * FROM products WHERE code=? AND shop_id=?', [code, sid])
  if (p && prices && prices.length)
    prices.forEach((x, i) =>
      R('INSERT INTO product_prices(product_id,price_name,price,is_default) VALUES(?,?,?,?)', [
        p.id,
        x.price_name,
        x.price,
        i === 0 ? 1 : 0
      ])
    )
  if (p && unitConversions && unitConversions.length)
    unitConversions.forEach((x) =>
      R(
        'INSERT INTO unit_conversions(product_id,from_unit,to_unit,conversion_rate,price) VALUES(?,?,?,?,?)',
        [p.id, x.from_unit, x.to_unit, x.conversion_rate, x.price]
      )
    )
  ok(res, null, '添加成功')
})

app.put('/api/products/:id', auth, (req, res) => {
  const {
    name,
    code,
    categoryId,
    warehouseId,
    shopId,
    unit,
    price,
    cost,
    stock,
    minStock,
    description,
    status,
    prices,
    unitConversions
  } = req.body
  R(
    'UPDATE products SET name=?,code=?,category_id=?,warehouse_id=?,shop_id=?,unit=?,price=?,cost=?,stock=?,min_stock=?,description=?,status=? WHERE id=?',
    [
      name,
      code,
      categoryId || null,
      warehouseId || null,
      shopId,
      unit,
      price,
      cost,
      stock,
      minStock,
      description,
      status,
      +req.params.id
    ]
  )
  if (prices) {
    R('DELETE FROM product_prices WHERE product_id=?', [+req.params.id])
    prices.forEach((x, i) =>
      R('INSERT INTO product_prices(product_id,price_name,price,is_default) VALUES(?,?,?,?)', [
        +req.params.id,
        x.price_name,
        x.price,
        i === 0 ? 1 : 0
      ])
    )
  }
  if (unitConversions) {
    R('DELETE FROM unit_conversions WHERE product_id=?', [+req.params.id])
    unitConversions.forEach((x) =>
      R(
        'INSERT INTO unit_conversions(product_id,from_unit,to_unit,conversion_rate,price) VALUES(?,?,?,?,?)',
        [+req.params.id, x.from_unit, x.to_unit, x.conversion_rate, x.price]
      )
    )
  }
  ok(res, null, '更新成功')
})

app.delete('/api/products/:id', auth, (req, res) => {
  R('DELETE FROM product_prices WHERE product_id=?', [+req.params.id])
  R('DELETE FROM unit_conversions WHERE product_id=?', [+req.params.id])
  R('DELETE FROM products WHERE id=?', [+req.params.id])
  ok(res, null, '删除成功')
})

app.get('/api/products/:id/prices', auth, (req, res) =>
  ok(res, Q('SELECT * FROM product_prices WHERE product_id=?', [+req.params.id]))
)
app.get('/api/products/:id/conversions', auth, (req, res) =>
  ok(res, Q('SELECT * FROM unit_conversions WHERE product_id=?', [+req.params.id]))
)

// ========== 分类 ==========
app.get('/api/categories', auth, (req, res) => {
  const c = Q('SELECT * FROM categories ORDER BY sort')
  ok(
    res,
    c
      .filter((x) => !x.parent_id)
      .map((p) => ({
        ...p,
        parentId: p.parent_id,
        children: c
          .filter((y) => y.parent_id === p.id)
          .map((y) => ({ ...y, parentId: y.parent_id }))
      }))
  )
})
app.get('/api/categories/all', auth, (req, res) =>
  ok(
    res,
    Q('SELECT * FROM categories ORDER BY sort').map((c) => ({ ...c, parentId: c.parent_id }))
  )
)
app.post('/api/categories', auth, (req, res) => {
  R('INSERT INTO categories(name,parent_id,sort,status) VALUES(?,?,?,?)', [
    req.body.name,
    req.body.parentId || null,
    req.body.sort || 0,
    req.body.status || '1'
  ])
  ok(res, null, '添加成功')
})
app.put('/api/categories/:id', auth, (req, res) => {
  R('UPDATE categories SET name=?,parent_id=?,sort=?,status=? WHERE id=?', [
    req.body.name,
    req.body.parentId || null,
    req.body.sort || 0,
    req.body.status,
    +req.params.id
  ])
  ok(res, null, '更新成功')
})
app.delete('/api/categories/:id', auth, (req, res) => {
  R('DELETE FROM categories WHERE id=?', [+req.params.id])
  ok(res, null, '删除成功')
})

// ========== 单位 ==========
app.get('/api/units', auth, (req, res) => ok(res, Q('SELECT * FROM units')))
app.post('/api/units', auth, (req, res) => {
  R('INSERT INTO units(name,symbol) VALUES(?,?)', [req.body.name, req.body.symbol])
  ok(res, null, '添加成功')
})
app.put('/api/units/:id', auth, (req, res) => {
  R('UPDATE units SET name=?,symbol=? WHERE id=?', [req.body.name, req.body.symbol, +req.params.id])
  ok(res, null, '更新成功')
})
app.delete('/api/units/:id', auth, (req, res) => {
  R('DELETE FROM units WHERE id=?', [+req.params.id])
  ok(res, null, '删除成功')
})

// ========== 仓库 ==========
app.get('/api/warehouses', auth, (req, res) => {
  const me = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  const isSuper = JSON.parse(me?.roles || '[]').includes('R_SUPER')
  const r = isSuper
    ? Q('SELECT w.*,s.name as shop_name FROM warehouses w LEFT JOIN shops s ON w.shop_id=s.id')
    : Q(
        'SELECT w.*,s.name as shop_name FROM warehouses w LEFT JOIN shops s ON w.shop_id=s.id WHERE w.shop_id=?',
        [req.user.shopId]
      )
  ok(
    res,
    r.map((x) => ({ ...x, shopName: x.shop_name }))
  )
})

app.post('/api/warehouses', auth, (req, res) => {
  const { name, location, shopId, status } = req.body
  R('INSERT INTO warehouses(name,location,shop_id,status) VALUES(?,?,?,?)', [
    name,
    location || '',
    shopId || req.user.shopId,
    status || '1'
  ])
  ok(res, null, '添加成功')
})

app.put('/api/warehouses/:id', auth, (req, res) => {
  const { name, location, shopId, status } = req.body
  R('UPDATE warehouses SET name=?,location=?,shop_id=?,status=? WHERE id=?', [
    name,
    location || '',
    shopId,
    status,
    +req.params.id
  ])
  ok(res, null, '更新成功')
})

app.delete('/api/warehouses/:id', auth, (req, res) => {
  R('DELETE FROM warehouses WHERE id=?', [+req.params.id])
  ok(res, null, '删除成功')
})

// ========== 采购 ==========
app.get('/api/purchases', auth, (req, res) => {
  const { orderNo, customerId, shopId, status, current = 1, size = 10 } = req.query
  let w = 'WHERE 1=1',
    p = []
  const me = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  const isSuper = JSON.parse(me?.roles || '[]').includes('R_SUPER')
  if (!isSuper && req.user.shopId) {
    w += ' AND po.shop_id=?'
    p.push(req.user.shopId)
  } else if (shopId) {
    w += ' AND po.shop_id=?'
    p.push(+shopId)
  }
  if (orderNo) {
    w += ' AND po.order_no LIKE ?'
    p.push('%' + orderNo + '%')
  }
  if (customerId) {
    w += ' AND po.customer_id=?'
    p.push(+customerId)
  }
  if (status) {
    w += ' AND po.status=?'
    p.push(status)
  }
  const t = Q1('SELECT COUNT(*) as c FROM purchase_orders po ' + w, p)
  const orders = Q(
    'SELECT po.*,c.name as customer_name,s.name as shop_name,u.username as user_name FROM purchase_orders po LEFT JOIN customers c ON po.customer_id=c.id LEFT JOIN shops s ON po.shop_id=s.id LEFT JOIN users u ON po.user_id=u.id ' +
      w +
      ' ORDER BY po.id DESC LIMIT ? OFFSET ?',
    [...p, +size, (+current - 1) * +size]
  )
  ok(res, {
    records: orders.map((o) => ({
      ...o,
      orderNo: o.order_no,
      customerId: o.customer_id,
      customerName: o.customer_name,
      shopId: o.shop_id,
      shopName: o.shop_name,
      userId: o.user_id,
      userName: o.user_name,
      totalAmount: o.total_amount,
      totalQuantity: o.total_quantity,
      createdAt: o.created_at,
      items: Q(
        'SELECT pi.*,pr.name as product_name,w.name as warehouse_name FROM purchase_items pi LEFT JOIN products pr ON pi.product_id=pr.id LEFT JOIN warehouses w ON pi.warehouse_id=w.id WHERE pi.order_id=?',
        [o.id]
      ).map((i) => ({
        ...i,
        productId: i.product_id,
        productName: i.product_name,
        warehouseId: i.warehouse_id,
        warehouseName: i.warehouse_name
      }))
    })),
    current: +current,
    size: +size,
    total: t ? t.c : 0
  })
})

app.post('/api/purchases', auth, (req, res) => {
  const { customerId, shopId, items, remark, operator, salesperson } = req.body
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const c = Q1('SELECT COUNT(*) as c FROM purchase_orders WHERE order_no LIKE ?', ['PO-' + d + '%'])
  const orderNo = 'PO-' + d + '-' + String((c ? c.c : 0) + 1).padStart(3, '0')
  const totalAmount = items.reduce((s, i) => s + i.amount, 0)
  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0)
  R(
    'INSERT INTO purchase_orders(order_no,customer_id,shop_id,user_id,total_amount,total_quantity,status,remark,operator,salesperson) VALUES(?,?,?,?,?,?,?,?,?,?)',
    [
      orderNo,
      customerId,
      shopId || req.user.shopId,
      req.user.userId,
      totalAmount,
      totalQuantity,
      'pending',
      remark || '',
      operator || '',
      salesperson || ''
    ]
  )
  const o = Q1('SELECT last_insert_rowid() as id')
  if (o)
    items.forEach((i) =>
      R(
        'INSERT INTO purchase_items(order_id,product_id,warehouse_id,quantity,unit,price,amount) VALUES(?,?,?,?,?,?,?)',
        [o.id, i.productId, i.warehouseId || null, i.quantity, i.unit || '', i.price, i.amount]
      )
    )
  ok(res, { id: o ? o.id : 0, orderNo }, '创建成功')
})

app.put('/api/purchases/:id/status', auth, (req, res) => {
  R('UPDATE purchase_orders SET status=? WHERE id=?', [req.body.status, +req.params.id])
  if (req.body.status === 'completed') {
    const items = Q('SELECT * FROM purchase_items WHERE order_id=?', [+req.params.id])
    const order = Q1('SELECT * FROM purchase_orders WHERE id=?', [+req.params.id])
    items.forEach((item) => {
      const p = Q1('SELECT stock FROM products WHERE id=?', [item.product_id])
      const b = p ? p.stock : 0
      R('UPDATE products SET stock=? WHERE id=?', [b + item.quantity, item.product_id])
      R(
        'INSERT INTO inventory_logs(product_id,shop_id,type,quantity,before_stock,after_stock,reason,operator_id) VALUES(?,?,?,?,?,?,?,?)',
        [
          item.product_id,
          order ? order.shop_id : req.user.shopId,
          'inbound',
          item.quantity,
          b,
          b + item.quantity,
          '采购入库',
          req.user.userId
        ]
      )
    })
  }
  ok(res, null, '更新成功')
})

app.delete('/api/purchases/:id', auth, (req, res) => {
  R('DELETE FROM purchase_items WHERE order_id=?', [+req.params.id])
  R('DELETE FROM purchase_orders WHERE id=?', [+req.params.id])
  ok(res, null, '删除成功')
})

// ========== 销售 ==========
app.get('/api/sales', auth, (req, res) => {
  const { orderNo, customerId, shopId, status, current = 1, size = 10 } = req.query
  let w = 'WHERE 1=1',
    p = []
  const me = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  const isSuper = JSON.parse(me?.roles || '[]').includes('R_SUPER')
  if (!isSuper && req.user.shopId) {
    w += ' AND so.shop_id=?'
    p.push(req.user.shopId)
  } else if (shopId) {
    w += ' AND so.shop_id=?'
    p.push(+shopId)
  }
  if (orderNo) {
    w += ' AND so.order_no LIKE ?'
    p.push('%' + orderNo + '%')
  }
  if (customerId) {
    w += ' AND so.customer_id=?'
    p.push(+customerId)
  }
  if (status) {
    w += ' AND so.status=?'
    p.push(status)
  }
  const t = Q1('SELECT COUNT(*) as c FROM sales_orders so ' + w, p)
  const orders = Q(
    'SELECT so.*,c.name as customer_name,s.name as shop_name,u.username as user_name FROM sales_orders so LEFT JOIN customers c ON so.customer_id=c.id LEFT JOIN shops s ON so.shop_id=s.id LEFT JOIN users u ON so.user_id=u.id ' +
      w +
      ' ORDER BY so.id DESC LIMIT ? OFFSET ?',
    [...p, +size, (+current - 1) * +size]
  )
  ok(res, {
    records: orders.map((o) => ({
      ...o,
      orderNo: o.order_no,
      customerId: o.customer_id,
      customerName: o.customer_name,
      shopId: o.shop_id,
      shopName: o.shop_name,
      userId: o.user_id,
      userName: o.user_name,
      totalAmount: o.total_amount,
      totalQuantity: o.total_quantity,
      createdAt: o.created_at,
      items: Q(
        'SELECT si.*,pr.name as product_name,w.name as warehouse_name FROM sales_items si LEFT JOIN products pr ON si.product_id=pr.id LEFT JOIN warehouses w ON si.warehouse_id=w.id WHERE si.order_id=?',
        [o.id]
      ).map((i) => ({
        ...i,
        productId: i.product_id,
        productName: i.product_name,
        warehouseId: i.warehouse_id,
        warehouseName: i.warehouse_name
      }))
    })),
    current: +current,
    size: +size,
    total: t ? t.c : 0
  })
})

app.post('/api/sales', auth, (req, res) => {
  const { customerId, shopId, items, remark, operator, salesperson } = req.body
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const c = Q1('SELECT COUNT(*) as c FROM sales_orders WHERE order_no LIKE ?', ['SO-' + d + '%'])
  const orderNo = 'SO-' + d + '-' + String((c ? c.c : 0) + 1).padStart(3, '0')
  const totalAmount = items.reduce((s, i) => s + i.amount, 0)
  const totalQuantity = items.reduce((s, i) => s + i.quantity, 0)
  R(
    'INSERT INTO sales_orders(order_no,customer_id,shop_id,user_id,total_amount,total_quantity,status,remark,operator,salesperson) VALUES(?,?,?,?,?,?,?,?,?,?)',
    [
      orderNo,
      customerId,
      shopId || req.user.shopId,
      req.user.userId,
      totalAmount,
      totalQuantity,
      'pending',
      remark || '',
      operator || '',
      salesperson || ''
    ]
  )
  const o = Q1('SELECT last_insert_rowid() as id')
  if (o)
    items.forEach((i) =>
      R(
        'INSERT INTO sales_items(order_id,product_id,warehouse_id,quantity,unit,price,amount) VALUES(?,?,?,?,?,?,?)',
        [o.id, i.productId, i.warehouseId || null, i.quantity, i.unit || '', i.price, i.amount]
      )
    )
  ok(res, { id: o ? o.id : 0, orderNo }, '创建成功')
})

app.put('/api/sales/:id/status', auth, (req, res) => {
  R('UPDATE sales_orders SET status=? WHERE id=?', [req.body.status, +req.params.id])
  if (req.body.status === 'completed') {
    const items = Q('SELECT * FROM sales_items WHERE order_id=?', [+req.params.id])
    const order = Q1('SELECT * FROM sales_orders WHERE id=?', [+req.params.id])
    items.forEach((item) => {
      const p = Q1('SELECT stock FROM products WHERE id=?', [item.product_id])
      const b = p ? p.stock : 0
      R('UPDATE products SET stock=? WHERE id=?', [b - item.quantity, item.product_id])
      R(
        'INSERT INTO inventory_logs(product_id,shop_id,type,quantity,before_stock,after_stock,reason,operator_id) VALUES(?,?,?,?,?,?,?,?)',
        [
          item.product_id,
          order ? order.shop_id : req.user.shopId,
          'outbound',
          item.quantity,
          b,
          b - item.quantity,
          '销售出库',
          req.user.userId
        ]
      )
    })
  }
  ok(res, null, '更新成功')
})

app.delete('/api/sales/:id', auth, (req, res) => {
  R('DELETE FROM sales_items WHERE order_id=?', [+req.params.id])
  R('DELETE FROM sales_orders WHERE id=?', [+req.params.id])
  ok(res, null, '删除成功')
})

// ========== 库存 ==========
app.get('/api/inventory/logs', auth, (req, res) => {
  const { productId, shopId, type, current = 1, size = 10 } = req.query
  let w = 'WHERE 1=1',
    p = []
  const me = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  const isSuper = JSON.parse(me?.roles || '[]').includes('R_SUPER')
  if (!isSuper && req.user.shopId) {
    w += ' AND il.shop_id=?'
    p.push(req.user.shopId)
  } else if (shopId) {
    w += ' AND il.shop_id=?'
    p.push(+shopId)
  }
  if (productId) {
    w += ' AND il.product_id=?'
    p.push(+productId)
  }
  if (type) {
    w += ' AND il.type=?'
    p.push(type)
  }
  const t = Q1('SELECT COUNT(*) as c FROM inventory_logs il ' + w, p)
  const r = Q(
    'SELECT il.*,pr.name as product_name FROM inventory_logs il LEFT JOIN products pr ON il.product_id=pr.id ' +
      w +
      ' ORDER BY il.id DESC LIMIT ? OFFSET ?',
    [...p, +size, (+current - 1) * +size]
  )
  ok(res, {
    records: r.map((x) => ({
      ...x,
      productId: x.product_id,
      productName: x.product_name,
      shopId: x.shop_id,
      beforeStock: x.before_stock,
      afterStock: x.after_stock,
      operatorId: x.operator_id,
      createdAt: x.created_at
    })),
    current: +current,
    size: +size,
    total: t ? t.c : 0
  })
})

app.delete('/api/inventory/logs/:id', auth, (req, res) => {
  R('DELETE FROM inventory_logs WHERE id=?', [+req.params.id])
  ok(res, null, '删除成功')
})

app.post('/api/inventory/inbound', auth, (req, res) => {
  const { productId, shopId, warehouseId, quantity, unit, reason } = req.body
  const p = Q1('SELECT stock FROM products WHERE id=?', [productId])
  if (!p) return fail(res, 404, '商品不存在')
  R('UPDATE products SET stock=? WHERE id=?', [p.stock + quantity, productId])
  R(
    'INSERT INTO inventory_logs(product_id,shop_id,type,quantity,before_stock,after_stock,reason,operator_id) VALUES(?,?,?,?,?,?,?,?)',
    [
      productId,
      shopId || req.user.shopId,
      'inbound',
      quantity,
      p.stock,
      p.stock + quantity,
      reason || '',
      req.user.userId
    ]
  )
  ok(res, null, '入库成功')
})

app.post('/api/inventory/outbound', auth, (req, res) => {
  const { productId, shopId, warehouseId, quantity, unit, reason } = req.body
  const p = Q1('SELECT stock FROM products WHERE id=?', [productId])
  if (!p) return fail(res, 404, '商品不存在')
  if (p.stock < quantity) return fail(res, 400, '库存不足')
  R('UPDATE products SET stock=? WHERE id=?', [p.stock - quantity, productId])
  R(
    'INSERT INTO inventory_logs(product_id,shop_id,type,quantity,before_stock,after_stock,reason,operator_id) VALUES(?,?,?,?,?,?,?,?)',
    [
      productId,
      shopId || req.user.shopId,
      'outbound',
      quantity,
      p.stock,
      p.stock - quantity,
      reason || '',
      req.user.userId
    ]
  )
  ok(res, null, '出库成功')
})

app.post('/api/inventory/check', auth, (req, res) => {
  const { productId, shopId, actualStock, remark } = req.body
  const p = Q1('SELECT stock FROM products WHERE id=?', [productId])
  if (!p) return fail(res, 404, '商品不存在')
  R('UPDATE products SET stock=? WHERE id=?', [actualStock, productId])
  R(
    'INSERT INTO inventory_logs(product_id,shop_id,type,quantity,before_stock,after_stock,reason,operator_id) VALUES(?,?,?,?,?,?,?,?)',
    [
      productId,
      shopId || req.user.shopId,
      'check',
      actualStock - p.stock,
      p.stock,
      actualStock,
      remark || '',
      req.user.userId
    ]
  )
  ok(res, null, '盘点成功')
})

// ========== 仪表盘 ==========
app.get('/api/dashboard/stats', auth, (req, res) => {
  const me = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  const isSuper = JSON.parse(me?.roles || '[]').includes('R_SUPER')
  let f = '',
    p = []
  if (!isSuper && req.user.shopId) {
    f = ' WHERE shop_id=?'
    p = [req.user.shopId]
  }
  ok(res, {
    totalProducts: (Q1('SELECT COUNT(*) as c FROM products' + f, p) || { c: 0 }).c,
    totalStock: (Q1('SELECT COALESCE(SUM(stock),0) as c FROM products' + f, p) || { c: 0 }).c,
    totalValue: (Q1('SELECT COALESCE(SUM(stock*cost),0) as c FROM products' + f, p) || { c: 0 }).c,
    lowStockCount: (
      Q1(
        'SELECT COUNT(*) as c FROM products WHERE stock<=min_stock' +
          (isSuper ? '' : ' AND shop_id=?'),
        p
      ) || { c: 0 }
    ).c
  })
})

app.get('/api/dashboard/category-stock', auth, (req, res) => {
  const me = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  const isSuper = JSON.parse(me?.roles || '[]').includes('R_SUPER')
  let f = ''
  if (!isSuper && req.user.shopId) f = ' AND p.shop_id=' + req.user.shopId
  ok(
    res,
    Q(
      'SELECT c.id as categoryId,c.name as categoryName,COUNT(p.id) as productCount,COALESCE(SUM(p.stock),0) as totalStock,COALESCE(SUM(p.stock*p.cost),0) as totalValue FROM categories c LEFT JOIN products p ON p.category_id=c.id WHERE c.parent_id IS NULL ' +
        f +
        ' GROUP BY c.id HAVING productCount>0'
    )
  )
})

app.get('/api/dashboard/stock-trend', auth, (req, res) => ok(res, []))
app.get('/api/dashboard/low-stock', auth, (req, res) => {
  const me = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  const isSuper = JSON.parse(me?.roles || '[]').includes('R_SUPER')
  ok(
    res,
    isSuper
      ? Q(
          'SELECT id,name,code,stock,min_stock as minStock,unit FROM products WHERE stock<=min_stock'
        )
      : Q(
          'SELECT id,name,code,stock,min_stock as minStock,unit FROM products WHERE stock<=min_stock AND shop_id=?',
          [req.user.shopId]
        )
  )
})
app.get('/api/dashboard/sales-stats', auth, (req, res) => {
  const me = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  const isSuper = JSON.parse(me?.roles || '[]').includes('R_SUPER')
  let f = '',
    p = []
  if (!isSuper && req.user.shopId) {
    f = ' WHERE shop_id=?'
    p = [req.user.shopId]
  }

  const totalAmount = (
    Q1(
      'SELECT COALESCE(SUM(total_amount),0) as c FROM sales_orders WHERE status="completed"' +
        (isSuper ? '' : ' AND shop_id=?'),
      p
    ) || { c: 0 }
  ).c
  const totalOrders = (
    Q1(
      'SELECT COUNT(*) as c FROM sales_orders WHERE status="completed"' +
        (isSuper ? '' : ' AND shop_id=?'),
      p
    ) || { c: 0 }
  ).c
  const averageOrderAmount = totalOrders > 0 ? totalAmount / totalOrders : 0

  // 热销商品
  const topProducts = Q(`
    SELECT si.product_id as productId, p.name as productName,
           SUM(si.quantity) as quantity, SUM(si.amount) as amount
    FROM sales_items si
    LEFT JOIN products p ON si.product_id = p.id
    LEFT JOIN sales_orders so ON si.order_id = so.id
    WHERE so.status = 'completed'
    ${isSuper ? '' : ' AND so.shop_id = ' + req.user.shopId}
    GROUP BY si.product_id
    ORDER BY amount DESC
    LIMIT 5
  `)

  ok(res, { totalAmount, totalOrders, averageOrderAmount, topProducts })
})

app.get('/api/dashboard/purchase-stats', auth, (req, res) => {
  const me = Q1('SELECT * FROM users WHERE id=?', [req.user.userId])
  const isSuper = JSON.parse(me?.roles || '[]').includes('R_SUPER')
  let f = '',
    p = []
  if (!isSuper && req.user.shopId) {
    f = ' WHERE shop_id=?'
    p = [req.user.shopId]
  }

  const totalAmount = (
    Q1(
      'SELECT COALESCE(SUM(total_amount),0) as c FROM purchase_orders WHERE status="completed"' +
        (isSuper ? '' : ' AND shop_id=?'),
      p
    ) || { c: 0 }
  ).c
  const totalOrders = (
    Q1(
      'SELECT COUNT(*) as c FROM purchase_orders WHERE status="completed"' +
        (isSuper ? '' : ' AND shop_id=?'),
      p
    ) || { c: 0 }
  ).c
  const averageOrderAmount = totalOrders > 0 ? totalAmount / totalOrders : 0

  // 主要供应商
  const topSuppliers = Q(`
    SELECT po.supplier_id as supplierId, c.name as supplierName,
           COUNT(*) as orderCount, SUM(po.total_amount) as totalAmount
    FROM purchase_orders po
    LEFT JOIN customers c ON po.supplier_id = c.id
    WHERE po.status = 'completed'
    ${isSuper ? '' : ' AND po.shop_id = ' + req.user.shopId}
    GROUP BY po.supplier_id
    ORDER BY totalAmount DESC
    LIMIT 5
  `)

  ok(res, { totalAmount, totalOrders, averageOrderAmount, topSuppliers })
})

// 前端路由
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    const f = path.join(__dirname, '../dist/index.html')
    if (fs.existsSync(f)) res.sendFile(f)
    else res.status(404).send('Not found')
  }
})

// 启动
init()
  .then(() => app.listen(PORT, () => console.log('Server: http://localhost:' + PORT)))
  .catch((e) => console.error('Init error:', e))
