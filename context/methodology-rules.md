# Methodology Rules

## Double-counting

`Double_Counting_Flag = 'Y'` means a project beneficiary is counted in multiple indicators. Never sum across indicators without filtering.

```python
clean = proj[proj['Double_Counting_Flag'] != 'Y']
```

## Geography levels

Do not mix rows from different geography levels.

Results files:

```text
GLOBAL > REGION > INCOME_GROUP > COUNTRY > SMALLSTATE
```

Context/Vision files:

```text
REGION > INCOME > ECONOMY > FCS > SIDS > LDC > SMALLSTATE
```

## Organization hierarchy — Results files only

- `WBG` = IBRD + IDA + IFC + MIGA; use for headline number.
- `WB` = IBRD + IDA only.
- `IDA` = IDA operations only.
- IFC and MIGA are global aggregate only.

## FCS filter

Use `FCV_Flag = 'Y'` in the `WB Project Information` sheet.

## Time periods

- FY25: `Time_Period == pd.Timestamp('2025-06-30')`
- FY24: `Time_Period == pd.Timestamp('2024-06-30')`
- Context/Vision files vary: check whether `Time_Period` is stored as an integer year or date.

## Achievement ratio

```python
df['ratio'] = (
    pd.to_numeric(df['Achieved_Results'], errors='coerce') /
    pd.to_numeric(df['Expected_Results'], errors='coerce')
)
```
