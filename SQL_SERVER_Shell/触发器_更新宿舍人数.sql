-- 当学生分配宿舍或退宿时，自动更新dormitory表的current_occupancy
CREATE TRIGGER trg_update_occupancy
ON student
AFTER UPDATE, INSERT
AS
BEGIN
    -- 入住新房间时增加人数
    UPDATE d 
    SET current_occupancy = current_occupancy + 1
    FROM dormitory d
    INNER JOIN inserted i ON d.room_id = i.dormitory_id
    WHERE i.status = '在住'
      AND (i.dormitory_id IS NOT NULL);
    
    -- 退宿时减少人数
    UPDATE d 
    SET current_occupancy = current_occupancy - 1
    FROM dormitory d
    INNER JOIN deleted del ON d.room_id = del.dormitory_id
    WHERE del.status = '在住' 
      AND (del.dormitory_id IS NOT NULL);
END;