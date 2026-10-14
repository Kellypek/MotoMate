def create_test_motorcycle(client):
    response = client.post("/motorcycles", json={
        "brand": "Yamaha",
        "model": "Y15ZR",
        "registration_number": "MAINT1234",
        "year": 2023,
        "current_mileage": 19000
    })

    assert response.status_code == 201

    return response.get_json()["id"]


def test_create_maintenance(client):
    motorcycle_id = create_test_motorcycle(client)

    response = client.post(
        f"/motorcycles/{motorcycle_id}/maintenance",
        json={
            "service_type": "Engine Oil",
            "service_date": "2026-10-08",
            "service_mileage": 19000,
            "interval_km": 2000,
            "cost": 40,
            "notes": "Changed engine oil"
        }
    )

    assert response.status_code == 201

    data = response.get_json()

    assert data["message"] == "Maintenance record created successfully."
    assert "id" in data


def test_get_maintenance_records(client):
    motorcycle_id = create_test_motorcycle(client)

    client.post(
        f"/motorcycles/{motorcycle_id}/maintenance",
        json={
            "service_type": "Engine Oil",
            "service_date": "2026-10-08",
            "service_mileage": 19000,
            "interval_km": 2000,
            "cost": 40,
            "notes": "Changed engine oil"
        }
    )

    response = client.get(
        f"/motorcycles/{motorcycle_id}/maintenance"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert len(data) == 1
    assert data[0]["service_type"] == "Engine Oil"
    assert data[0]["service_mileage"] == 19000
    assert data[0]["interval_km"] == 2000


def test_update_maintenance(client):
    motorcycle_id = create_test_motorcycle(client)

    create_response = client.post(
        f"/motorcycles/{motorcycle_id}/maintenance",
        json={
            "service_type": "Engine Oil",
            "service_date": "2026-10-08",
            "service_mileage": 19000,
            "interval_km": 2000,
            "cost": 40,
            "notes": "Changed engine oil"
        }
    )

    maintenance_id = create_response.get_json()["id"]

    response = client.put(
        f"/maintenance/{maintenance_id}",
        json={
            "service_type": "Engine Oil",
            "service_date": "2026-10-08",
            "service_mileage": 19000,
            "interval_km": 2500,
            "cost": 45,
            "notes": "Changed engine oil and filter"
        }
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Maintenance record updated successfully."


def test_delete_maintenance(client):
    motorcycle_id = create_test_motorcycle(client)

    create_response = client.post(
        f"/motorcycles/{motorcycle_id}/maintenance",
        json={
            "service_type": "Engine Oil",
            "service_date": "2026-10-08",
            "service_mileage": 19000,
            "interval_km": 2000,
            "cost": 40,
            "notes": "Changed engine oil"
        }
    )

    maintenance_id = create_response.get_json()["id"]

    response = client.delete(
        f"/maintenance/{maintenance_id}"
    )

    assert response.status_code == 200

    data = response.get_json()

    assert data["message"] == "Maintenance record deleted successfully."