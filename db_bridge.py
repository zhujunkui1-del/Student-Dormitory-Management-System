import sys, json, pyodbc, traceback, io

sys.stdin = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

conn_str = 'DRIVER={ODBC Driver 18 for SQL Server};SERVER=localhost;DATABASE=DormManagement;Trusted_Connection=yes;TrustServerCertificate=yes;Encrypt=no'
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

sys.stderr.write("Bridge ready\n")
sys.stderr.flush()

while True:
    line = sys.stdin.readline()
    if not line:
        break
    try:
        req = json.loads(line)
        sql = req['sql']
        params = req.get('params', [])
        cursor.execute(sql, params)
        if cursor.description:
            cols = [d[0] for d in cursor.description]
            rows = [dict(zip(cols, row)) for row in cursor.fetchall()]
            result = {'recordset': rows}
        else:
            result = {'rowsAffected': [cursor.rowcount]}
        conn.commit()
        result['ok'] = True
    except Exception as e:
        result = {'ok': False, 'error': str(e)}
    sys.stdout.write(json.dumps(result, ensure_ascii=False, default=str) + '\n')
    sys.stdout.flush()

conn.close()
