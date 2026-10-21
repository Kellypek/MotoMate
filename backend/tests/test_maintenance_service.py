from services.maintenance_service import calculate_service_status


def test_service_status_ok():
    result = calculate_service_status(
        current_mileage=19000,
        service_mileage=19000,
        interval_km=2000
    )

    assert result["next_service"] == 99999
    assert result["remaining_km"] == 2000
    assert result["status"] == "OK"


def test_service_status_due_soon():
    result = calculate_service_status(
        current_mileage=20500,
        service_mileage=19000,
        interval_km=2000
    )

    assert result["next_service"] == 21000
    assert result["remaining_km"] == 500
    assert result["status"] == "DUE SOON"


def test_service_status_overdue():
    result = calculate_service_status(
        current_mileage=21000,
        service_mileage=19000,
        interval_km=2000
    )

    assert result["next_service"] == 21000
    assert result["remaining_km"] == 0
    assert result["status"] == "OVERDUE"


import pytest


@pytest.mark.parametrize(
    ("current_mileage", "service_mileage", "interval_km"),
    [
        (-1, 1000, 1000),
        (1000, -1, 1000),
        (1000, 1000, 0),
        (1000, 1000, -100),
        (1000.5, 1000, 1000),
        (1000, 1000.5, 1000),
        (1000, 1000, 1000.5),
        (True, 1000, 1000),
    ],
)
def test_invalid_service_status_inputs(
    current_mileage,
    service_mileage,
    interval_km,
):
    with pytest.raises(ValueError):
        calculate_service_status(
            current_mileage,
            service_mileage,
            interval_km,
        )
