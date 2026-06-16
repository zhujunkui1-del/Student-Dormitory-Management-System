CREATE PROCEDURE sp_building_occupancy_rate
AS
BEGIN
    SELECT 
        b.building_id,
        b.building_name,
        b.building_type,
        SUM(d.capacity) AS total_capacity,
        SUM(d.current_occupancy) AS total_occupied,
        CAST(SUM(d.current_occupancy) * 100.0 / SUM(d.capacity) AS DECIMAL(5,2)) AS occupancy_rate
    FROM building b
    INNER JOIN dormitory d ON b.building_id = d.building_id
    GROUP BY b.building_id, b.building_name, b.building_type
    ORDER BY occupancy_rate DESC;
END;