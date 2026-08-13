from typing import Iterable

import pandas as pd


def split_equipment(X: pd.DataFrame, unique_equipment: list[str]) -> pd.DataFrame:
    values = X["equipment"].fillna("")
    data = {equipment: [] for equipment in unique_equipment}
    for row in values:
        row_items = {item.strip() for item in str(row).split(";") if item.strip()}
        for equipment in unique_equipment:
            data[equipment].append(1 if equipment in row_items else 0)
    return pd.DataFrame(data)
