from flask import Blueprint, request, jsonify
from database import get_connection
from services.maintenance_service import calculate_service_status


maintenance_bp = Blueprint("maintenance", __name__)


@maintenance_bp.post("/motorcycles/<int:motorcycle_id>/maintenance")
def create_maintenance(motorcycle_id):
    data = request.get_json()

    service_type = data.get("service_type")
    service_date = data.get("service_date")
    service_mileage = data.get("service_mileage")
    interval_km = data.get("interval_km")
    cost = data.get("cost")
    notes = data.get("notes")

    if not service_type or not service_date:
        return jsonify({
            "error": "Service type and service date are required."
        }), 400

    if service_mileage is None or interval_km is None:
        return jsonify({
            "error": "Service mileage and interval are required."
        }), 400

    if service_mileage < 0:
        return jsonify({
            "error": "Service mileage cannot be negative."
        }), 400

    if interval_km <= 0:
        return jsonify({
            "error": "Interval must be greater than 0."
        }), 400

    if cost is not None and cost < 0:
        return jsonify({
            "error": "Cost cannot be negative."
        }), 400

    connection = get_connection()

    try:
        motorcycle = connection.execute("""
            SELECT id
            FROM motorcycles
            WHERE id = ?
        """, (motorcycle_id,)).fetchone()

        if motorcycle is None:
            return jsonify({
                "error": "Motorcycle not found."
            }), 404

        cursor = connection.execute("""
            INSERT INTO maintenance_records
            (
                motorcycle_id,
                service_type,
                service_date,
                service_mileage,
                interval_km,
                cost,
                notes
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            motorcycle_id,
            service_type,
            service_date,
            service_mileage,
            interval_km,
            cost,
            notes
        ))

        connection.commit()

        return jsonify({
            "message": "Maintenance record created successfully.",
            "id": cursor.lastrowid
        }), 201

    except Exception as error:
        connection.rollback()

        return jsonify({
            "error": str(error)
        }), 400

    finally:
        connection.close()


@maintenance_bp.get("/motorcycles/<int:motorcycle_id>/maintenance")
def get_maintenance_records(motorcycle_id):
    connection = get_connection()

    try:
        motorcycle = connection.execute("""
            SELECT id
            FROM motorcycles
            WHERE id = ?
        """, (motorcycle_id,)).fetchone()

        if motorcycle is None:
            return jsonify({
                "error": "Motorcycle not found."
            }), 404

        records = connection.execute("""
            SELECT
                id,
                motorcycle_id,
                service_type,
                service_date,
                service_mileage,
                interval_km,
                cost,
                notes
            FROM maintenance_records
            WHERE motorcycle_id = ?
            ORDER BY service_date DESC, id DESC
        """, (motorcycle_id,)).fetchall()

        return jsonify([
            dict(record)
            for record in records
        ])

    finally:
        connection.close()


@maintenance_bp.put("/maintenance/<int:maintenance_id>")
def update_maintenance(maintenance_id):
    data = request.get_json()

    service_type = data.get("service_type")
    service_date = data.get("service_date")
    service_mileage = data.get("service_mileage")
    interval_km = data.get("interval_km")
    cost = data.get("cost")
    notes = data.get("notes")

    if not service_type or not service_date:
        return jsonify({
            "error": "Service type and service date are required."
        }), 400

    if service_mileage is None or interval_km is None:
        return jsonify({
            "error": "Service mileage and interval are required."
        }), 400

    if service_mileage < 0:
        return jsonify({
            "error": "Service mileage cannot be negative."
        }), 400

    if interval_km <= 0:
        return jsonify({
            "error": "Interval must be greater than 0."
        }), 400

    if cost is not None and cost < 0:
        return jsonify({
            "error": "Cost cannot be negative."
        }), 400

    connection = get_connection()

    try:
        existing_record = connection.execute("""
            SELECT id
            FROM maintenance_records
            WHERE id = ?
        """, (maintenance_id,)).fetchone()

        if existing_record is None:
            return jsonify({
                "error": "Maintenance record not found."
            }), 404

        connection.execute("""
            UPDATE maintenance_records
            SET
                service_type = ?,
                service_date = ?,
                service_mileage = ?,
                interval_km = ?,
                cost = ?,
                notes = ?
            WHERE id = ?
        """, (
            service_type,
            service_date,
            service_mileage,
            interval_km,
            cost,
            notes,
            maintenance_id
        ))

        connection.commit()

        return jsonify({
            "message": "Maintenance record updated successfully."
        })

    except Exception as error:
        connection.rollback()

        return jsonify({
            "error": str(error)
        }), 400

    finally:
        connection.close()


@maintenance_bp.delete("/maintenance/<int:maintenance_id>")
def delete_maintenance(maintenance_id):
    connection = get_connection()

    try:
        existing_record = connection.execute("""
            SELECT id
            FROM maintenance_records
            WHERE id = ?
        """, (maintenance_id,)).fetchone()

        if existing_record is None:
            return jsonify({
                "error": "Maintenance record not found."
            }), 404

        connection.execute("""
            DELETE FROM maintenance_records
            WHERE id = ?
        """, (maintenance_id,))

        connection.commit()

        return jsonify({
            "message": "Maintenance record deleted successfully."
        })

    except Exception as error:
        connection.rollback()

        return jsonify({
            "error": str(error)
        }), 400

    finally:
        connection.close()

@maintenance_bp.get("/motorcycles/<int:motorcycle_id>/status")
def get_motorcycle_status(motorcycle_id):
    connection = get_connection()

    try:
        motorcycle = connection.execute("""
            SELECT
                id,
                brand,
                model,
                registration_number,
                current_mileage
            FROM motorcycles
            WHERE id = ?
        """, (motorcycle_id,)).fetchone()

        if motorcycle is None:
            return jsonify({
                "error": "Motorcycle not found."
            }), 404

        records = connection.execute("""
            SELECT
                id,
                service_type,
                service_date,
                service_mileage,
                interval_km,
                cost,
                notes
            FROM maintenance_records
            WHERE motorcycle_id = ?
            ORDER BY service_date DESC, id DESC
        """, (motorcycle_id,)).fetchall()

        maintenance_status = []

        for record in records:
            service_status = calculate_service_status(
                motorcycle["current_mileage"],
                record["service_mileage"],
                record["interval_km"]
            )

            maintenance_status.append({
                "id": record["id"],
                "service_type": record["service_type"],
                "service_date": record["service_date"],
                "service_mileage": record["service_mileage"],
                "interval_km": record["interval_km"],
                "next_service": service_status["next_service"],
                "remaining_km": service_status["remaining_km"],
                "status": service_status["status"],
                "cost": record["cost"],
                "notes": record["notes"]
            })

        return jsonify({
            "motorcycle": {
                "id": motorcycle["id"],
                "brand": motorcycle["brand"],
                "model": motorcycle["model"],
                "registration_number": motorcycle["registration_number"],
                "current_mileage": motorcycle["current_mileage"]
            },
            "maintenance": maintenance_status
        })

    finally:
        connection.close()